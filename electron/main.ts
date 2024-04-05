/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from "electron";
import * as path from "path";
import { getGoogleBook, searchGoogleBooks } from "../backend/googlebooks";
import { imageSearch } from "../backend/googleimagesearch";
import { initUserDirs, loadSettings, saveSettings } from "../backend/userdata";
import { addBookImage, readAllBooks, readBook, saveBook } from "../backend/bookdata";
import { checkForUpdate } from "../backend/updates";
import packageJson from "../package.json";
import { UserSettings } from "../types/global";
import { searchOpenLibrary, searchOpenLibraryWorkByISBN } from "../backend/openlibrary";

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
      checkForUpdate(APP_VERSION).then((updateAvailable) => {
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
  settings.appVersion = APP_VERSION;

  // --------- Bridge ---------

  ipcMain.on("getBookData", (event, book: Book) => {
    // If using both search engines, get the Google Books data, then supplement with OpenLibrary.
    if (settings.searchEngines.includes("googleBooks") && settings.searchEngines.includes("openLibrary")) {
      getGoogleBook(book.ids.googleBooksId, settings.googleApiKey).then((updatedBook) => {
        if (!updatedBook) {
          // we already have some data, so save what we've already fetched
          event.reply("receiveBookData", book);
        } else if (updatedBook.ids.isbn) {
          searchOpenLibraryWorkByISBN(updatedBook.ids.isbn).then((olBook) => {
            if (olBook) {
              updatedBook.datePublished = olBook.datePublished; // OpenLibrary accurate to original publish date
              updatedBook.ids.openLibraryId = olBook.ids.openLibraryId;
              updatedBook.ids.amazonId = olBook.ids.amazonId;
              updatedBook.ids.goodreadsId = olBook.ids.goodreadsId;
              updatedBook.ids.internetArchiveId = olBook.ids.internetArchiveId;
              updatedBook.ids.libraryThingId = olBook.ids.libraryThingId;
              updatedBook.ids.oclcId = olBook.ids.oclcId;
              updatedBook.ids.wikidataId = olBook.ids.wikidataId;
            }
            event.reply("receiveBookData", updatedBook);
          });
        } else {
          event.reply("receiveBookData", updatedBook);
        }
      });
    }
    // If just using Google Books, fetch full data.
    else if (settings.searchEngines.includes("googleBooks")) {
      getGoogleBook(book.ids.googleBooksId, settings.googleApiKey).then((updatedBook) =>
        event.reply("receiveBookData", updatedBook),
      );
    }
    // If just using OpenLibrary, there's no more data to get.
    else {
      event.reply("receiveBookData", book);
    }
  });

  ipcMain.on("searchBook", (event, q: string) => {
    if (settings.searchEngines.includes("googleBooks")) {
      searchGoogleBooks(q, settings.googleApiKey).then((res) => event.reply("searchBookResults", res));
    } else {
      searchOpenLibrary(q).then((res) => event.reply("searchBookResults", res));
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
    settings.appVersion = APP_VERSION;
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
