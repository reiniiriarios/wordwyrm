/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from "electron";
import * as path from "path";
import { getBook, searchBook } from "../backend/googlebooks";
import { initUserDirs, loadSettings, saveSettings } from "../backend/userdata";
import { addBookImage, readAllBooks, readBook, saveBook } from "../backend/bookdata";
import { hasUpdate } from "../backend/updates";
import { imageSearch } from "../backend/imagesearch";
import { Book } from "@data/book";
import type { UserSettings } from "../types/global";
import packageJson from "../package.json";

const PORT = 5000;
const DEBUG = process.env.DEBUG === "true";
const APP_VERSION = packageJson.version;

let settings: UserSettings;

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
    icon: "assets/icons/512x512.png",
  });
  mainWindow.maximize();
  mainWindow.removeMenu();

  if (DEBUG) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }

  // Intercept a click on anchor with `target="_blank"`.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      try {
        shell.openExternal(url);
      } catch (error: unknown) {
        console.error(`Failed to open url: ${error}`);
      }
    }
    return { action: "deny" };
  });

  // Check if app is latest version.
  mainWindow.webContents.once("dom-ready", () => {
    mainWindow.webContents.send("check-version");
    ipcMain.once("check-version", (event) => {
      hasUpdate(APP_VERSION, (updateAvailable) => {
        if (updateAvailable) {
          event.reply("updateAvailable", updateAvailable);
        }
      });
    });
  });

  return mainWindow;
}

app.on("ready", () => {
  let window = createWindow();

  protocol.handle("localfile", (request) => {
    let url = request.url.slice("localfile://".length).replace(/\\/g, "/").replace(/ /g, "%20");
    if (url.charAt(0) !== "/") url = "/" + url;
    return net.fetch("file://" + url);
  });
  protocol.handle("bookimage", (request) => {
    let url = path
      .join(settings.booksDir, request.url.slice("bookimage://".length))
      .replace(/\\/g, "/")
      .replace(/ /g, "%20");
    if (url.charAt(0) !== "/") url = "/" + url;
    return net.fetch("file://" + url);
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = createWindow();
    }
  });

  // Create user data directories if not already present.
  initUserDirs();
  settings = loadSettings();

  // --------- Bridge ---------

  ipcMain.on("getBookData", (event, id?: string) => {
    if (id && settings.googleApiKey) {
      getBook(id, settings.googleApiKey).then((res) => event.reply("receiveBookData", res));
    }
  });

  ipcMain.on("searchBook", (event, q: string) => {
    if (settings.googleApiKey) {
      searchBook(q, settings.googleApiKey).then((res) => event.reply("searchBookResults", res));
    }
  });

  ipcMain.on("readAllBooks", (event) => {
    if (settings.booksDir) {
      readAllBooks(settings.booksDir).then((res) => event.reply("receiveAllBooks", res));
    }
  });

  ipcMain.on("readBook", (event, authorDir: string, filename: string) => {
    if (settings.booksDir) {
      readBook(settings.booksDir, authorDir, filename).then((res) => event.reply("receiveBook", res));
    }
  });

  ipcMain.on("saveBook", (event, book: Book) => {
    if (settings.booksDir) {
      saveBook(settings.booksDir, book).then((res) => event.reply("bookSaved", res));
    }
  });

  ipcMain.on("editBook", (event, book: Book, authorDir: string, filename: string) => {
    if (settings.booksDir) {
      saveBook(settings.booksDir, book, authorDir, filename).then((res) => event.reply("bookSaved", res));
    }
  });

  ipcMain.on("selectDataDir", async (event) => {
    dialog
      .showOpenDialog(window, {
        defaultPath: settings?.booksDir ?? "",
        properties: ["openDirectory"],
        buttonLabel: "Choose",
      })
      .then((result) => {
        if (result.filePaths[0].length) {
          event.reply("dirSelected", result.filePaths[0]);
        }
      });
  });

  ipcMain.on("loadSettings", (event) => {
    settings = loadSettings();
    event.reply("settingsLoaded", settings);
  });

  ipcMain.on("saveSettings", (event, newSettings: UserSettings) => {
    settings = newSettings;
    saveSettings(newSettings);
    event.reply("settingsLoaded", settings);
  });

  ipcMain.on("imageSearch", (event, author: string, title: string) => {
    if (settings.googleApiKey && settings.googleSearchEngineId) {
      imageSearch(settings.googleApiKey, settings.googleSearchEngineId, author, title).then((res) =>
        event.reply("imageSearchResults", res),
      );
    }
  });

  ipcMain.on("addBookImage", (event, book: Book, url: string) => {
    addBookImage(settings.booksDir, book, url).then(() => event.reply("bookImageAdded"));
  });

  // ------- End Bridge -------
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
