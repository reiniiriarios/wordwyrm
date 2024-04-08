/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, net, protocol, shell } from "electron";
import * as path from "path";
import packageJson from "../package.json";
import { UserSettings } from "../types/global";
import { initUserDirs, loadSettings, saveSettings } from "./scripts/userData";
import { addBookImage, addBookImageBase64, deleteBook, readAllBooks, readBook, saveBook } from "./scripts/bookData";
import { checkForUpdate } from "./scripts/updates";
import { getGoogleBook, searchGoogleBooks } from "./api/googleBooks";
import { googleImageSearch } from "./api/googleImageSearch";
import { searchOpenLibrary, searchOpenLibraryWorkByISBN } from "./api/openLibrary";

const PORT = 5000;
const DEBUG = process.env.DEBUG === "true";
const APP_VERSION = packageJson.version;

let settings: UserSettings;

function createWindow(): BrowserWindow {
  nativeTheme.themeSource = "dark";

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

  return mainWindow;
}

app.on("ready", () => {
  let window = createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = createWindow();
    }
  });

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

  // Intercept a click on anchor with `target="_blank"`.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      try {
        shell.openExternal(url);
      } catch (error: unknown) {
        console.error(`Failed to open url: ${error}`);
      }
    }
    return { action: "deny" };
  });

  // Create user data directories if not already present.
  initUserDirs();
  settings = loadSettings();
  settings.appVersion = APP_VERSION;

  // --------- Bridge ---------

  ipcMain.on("checkVersion", (event) => {
    checkForUpdate(APP_VERSION).then((updateAvailable) => {
      if (updateAvailable) {
        event.reply("updateAvailable", updateAvailable);
      }
    });
  });

  ipcMain.on("getBookData", async (event, book: Book) => {
    // If using both search engines, get the Google Books data, then supplement with OpenLibrary.
    if (settings.searchEngines.includes("googleBooks") && settings.searchEngines.includes("openLibrary")) {
      let googleBookP: Promise<Book>;
      let olBookP: Promise<Book>;
      let googleBook: Book | null = null;
      let olBook: Book | null = null;

      // Run first two queries async.
      if (book.ids.googleBooksId) googleBookP = getGoogleBook(book.ids.googleBooksId, settings.googleApiKey);
      if (book.ids.isbn) olBookP = searchOpenLibraryWorkByISBN(book.ids.isbn);

      // Wait for data.
      if (book.ids.googleBooksId) googleBook = await googleBookP;
      if (book.ids.isbn) olBook = await olBookP;

      // If we didn't have either of the necessary ids, run those async.
      if (!olBook && googleBook.ids.isbn) olBookP = searchOpenLibraryWorkByISBN(googleBook.ids.isbn);
      if (!googleBook && olBook.ids.googleBooksId)
        googleBookP = getGoogleBook(olBook.ids.googleBooksId, settings.googleApiKey);

      // Wait on secondary data if any.
      if (!olBook && googleBook.ids.isbn) olBook = await olBookP;
      if (!googleBook && olBook.ids.googleBooksId) googleBook = await googleBookP;

      if (googleBook) book = googleBook;
      if (olBook) {
        // OpenLibrary accurate to original publish date
        if (olBook.datePublished) book.datePublished = olBook.datePublished;
        if (!book.ids.googleBooksId && olBook.ids.googleBooksId) book.ids.googleBooksId = olBook.ids.googleBooksId;
        book.ids.openLibraryId = olBook.ids.openLibraryId;
        book.ids.amazonId = olBook.ids.amazonId;
        book.ids.goodreadsId = olBook.ids.goodreadsId;
        book.ids.internetArchiveId = olBook.ids.internetArchiveId;
        book.ids.libraryThingId = olBook.ids.libraryThingId;
        book.ids.oclcId = olBook.ids.oclcId;
        book.ids.wikidataId = olBook.ids.wikidataId;
      }
    }
    // If just using Google Books, fetch full data.
    else if (settings.searchEngines.includes("googleBooks")) {
      getGoogleBook(book.ids.googleBooksId, settings.googleApiKey).then((updatedBook) => {
        if (updatedBook) book = updatedBook;
      });
    }
    // If just using OpenLibrary, there's no more data to get.
    event.reply("receiveBookData", book);
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

  ipcMain.on("imageSearch", (event, author: string, title: string, page: number) => {
    if (settings.googleApiKey && settings.googleSearchEngineId) {
      googleImageSearch(settings.googleApiKey, settings.googleSearchEngineId, author, title, page).then((res) =>
        event.reply("imageSearchResults", res),
      );
    }
  });

  ipcMain.on("addBookImage", (event, book: Book, url: string) => {
    addBookImage(settings.booksDir, book, url).then(() => event.reply("bookImageAdded"));
  });

  ipcMain.on("addBookImageBase64", (event, book: Book, base64: string) => {
    addBookImageBase64(settings.booksDir, book, base64).then(() => event.reply("bookImageBase64Added"));
  });

  ipcMain.on("deleteBook", (event, book: Book) => {
    deleteBook(settings.booksDir, book).then(() => event.reply("bookDeleted"));
  });

  // ------- End Bridge -------
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
