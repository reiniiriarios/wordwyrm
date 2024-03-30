/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, dialog, ipcMain, net, protocol } from "electron";
import * as path from "path";
import { getBook, searchBook } from "../backend/googlebooks";
import { initUserDirs, loadSettings, saveSettings } from "../backend/userdata";
import { addBookImage, readAllBooks, readBook, saveBook } from "../backend/bookdata";
import { imageSearch } from "../backend/imagesearch";
import { Book } from "@data/book";
const PORT = 5000;
const DEBUG = process.env.DEBUG === "true";

let settings: Record<string, any> = {};

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  mainWindow.maximize();

  if (DEBUG) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }

  return mainWindow;
}

app.on("ready", () => {
  let window = createWindow();

  protocol.handle("localfile", (request) => net.fetch("file://" + request.url.slice("localfile://".length)));
  protocol.handle("bookimage", (request) =>
    net.fetch("file://" + path.join(settings.booksDir, request.url.slice("bookimage://".length))),
  );

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = createWindow();
    }
  });

  // Create user data directories if not already present.
  initUserDirs();
  settings = loadSettings();

  // --------- Bridge ---------

  ipcMain.on("getBookData", (event, id: string) => {
    getBook(id).then((res) => event.reply("receiveBookData", res));
  });

  ipcMain.on("searchBook", (event, q: string) => {
    searchBook(q).then((res) => event.reply("searchBookResults", res));
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
          settings.booksDir = result.filePaths[0];
          saveSettings(settings);
          event.reply("dirSelected", settings.booksDir);
        }
      });
  });

  ipcMain.on("loadSettings", (event) => {
    settings = loadSettings();
    event.reply("settingsLoaded", settings);
  });

  ipcMain.on("imageSearch", (event, author: string, title: string) => {
    imageSearch(author, title).then((res) => event.reply("imageSearchResults", res));
  });

  ipcMain.on("addBookImage", (_event, authorDir: string, filename: string, url: string) => {
    addBookImage(authorDir, filename, url);
  });

  // ------- End Bridge -------
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
