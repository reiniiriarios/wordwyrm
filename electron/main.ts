/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, dialog, ipcMain, nativeTheme, net, protocol, shell } from "electron";
import log from "electron-log/main";
import * as path from "path";
import packageJson from "../package.json";
import { UserSettings } from "../types/global";
import { DATA_PATH, initUserDirs, loadSettings, saveSettings } from "./scripts/userData";
import { addBookImage, addBookImageBase64, deleteBook, readAllBooks, readBook, saveBook } from "./scripts/bookData";
import { checkForUpdate } from "./scripts/updates";
import { getGoogleBook, searchGoogleBooks } from "./api/googleBooks";
import { googleImageSearch } from "./api/googleImageSearch";
import { searchOpenLibrary, searchOpenLibraryWorkByISBN } from "./api/openLibrary";
import { parseErr } from "./error";
import { LogMessage } from "electron-log";

const PORT = 5000;
const DEV_MODE = process.env.WYRM_ENV === "dev";
const PKG = process.env.WYRM_PKG ?? "__none__";
const SCREENSHOT_MODE = process.env.WYRM_PREV === "true";
const APP_VERSION = packageJson.version;

let settings: UserSettings;

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1445,
    height: 815,
    minWidth: 1200,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
    icon: "assets/icons/512x512.png",
  });
  mainWindow.removeMenu();

  if (DEV_MODE) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    if (!SCREENSHOT_MODE) {
      log.info("Opening dev tools");
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }

  // Create user data directories if not already present.
  let migrateData = initUserDirs();
  settings = loadSettings({ migrateData }); // throws error, app hasn't started yet though
  settings.appVersion = APP_VERSION;
  setWindowTheme(settings.theme);

  if (!SCREENSHOT_MODE) {
    mainWindow.setBounds(settings.bounds);
  }

  mainWindow.on("close", function () {
    // only if already loaded, thx
    // use default size for screenshot mode
    if (settings && !SCREENSHOT_MODE) {
      settings.bounds = mainWindow.getBounds();
      saveSettings(settings, {}, (err) => {
        if (err) log.error(err);
      });
    }
  });

  // Intercept a click on anchor with `target="_blank"`.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      try {
        shell.openExternal(url);
      } catch (error: unknown) {
        log.error(`Failed to open url: ${error}`);
      }
    }
    return { action: "deny" };
  });

  return mainWindow;
}

function setWindowTheme(theme: string) {
  if (["rosepineDawn", "nordLight"].includes(theme)) {
    nativeTheme.themeSource = "light";
  } else {
    nativeTheme.themeSource = "dark";
  }
}

app.on("ready", () => {
  // Setup logging
  log.transports.file.level = "debug";
  log.transports.file.format = "{h}:{i}:{s}.{ms} › [{level}] {text}";
  log.transports.console.level = "debug";
  // log.transports.console.format = "{h}:{i}:{s}.{ms} › [{level}] {text}";
  log.transports.console.format = ({ message }: { message: LogMessage }): any[] => {
    const d = message.date || new Date();
    const h = d.getHours().toString(10).padStart(2, "0");
    const i = d.getMinutes().toString(10).padStart(2, "0");
    const s = d.getSeconds().toString(10).padStart(2, "0");
    const m = d.getMilliseconds().toString(10).padStart(3, "0");
    const level = `[${message.level || "info"}]`.padEnd(7, " ");
    const c = { debug: 34, info: 36, warn: 33, error: 31 }[message.level] ?? 35;
    return [`\x1b[30m${h}:${i}:${s}.${m} \x1b[${c}m${level}\x1b[0m`, ...message.data];
  };
  log.transports.file.resolvePathFn = (variables) => {
    return path.join(DATA_PATH, "logs", variables.fileName);
  };
  log.initialize();

  // Start
  log.info(`Starting in ${DEV_MODE ? "DEV" : "PRODUCTION"} mode`);
  log.info(`Package: ${PKG}`);
  if (SCREENSHOT_MODE) {
    log.info("SCREENSHOT mode active");
  }

  // Create window
  let window = createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      window = createWindow();
    }
  });

  // Protocol handlers
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

  // --------- Bridge ---------

  ipcMain.on("checkVersion", (event) => {
    checkForUpdate(APP_VERSION)
      .then((updateAvailable) => {
        if (updateAvailable) {
          event.reply("updateAvailable", updateAvailable);
        }
      })
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("getBookData", async (event, book: Book) => {
    // If using both search engines, get the Google Books data, then supplement with OpenLibrary.
    if (settings.searchEngines.includes("googleBooks") && settings.searchEngines.includes("openLibrary")) {
      let googleBookP: Promise<Book>;
      let olBookP: Promise<Book>;
      let googleBook: Book | null = null;
      let olBook: Book | null = null;

      try {
        // Run first two queries async.
        if (book.ids.googleBooksId) googleBookP = getGoogleBook(book.ids.googleBooksId);
        if (book.ids.isbn) olBookP = searchOpenLibraryWorkByISBN(book.ids.isbn);

        // Wait for data.
        if (book.ids.googleBooksId) googleBook = await googleBookP;
        if (book.ids.isbn) olBook = await olBookP;

        // If we didn't have either of the necessary ids, run those async.
        if (!olBook && googleBook.ids.isbn) olBookP = searchOpenLibraryWorkByISBN(googleBook.ids.isbn);
        if (!googleBook && olBook.ids.googleBooksId) googleBookP = getGoogleBook(olBook.ids.googleBooksId);
      } catch (e) {
        event.reply("error", parseErr(e));
      }

      // Wait on secondary data if any.
      if (!olBook && googleBook.ids.isbn) olBook = await olBookP;
      if (!googleBook && olBook.ids.googleBooksId) googleBook = await googleBookP;

      if (googleBook) book = googleBook;
      if (olBook) {
        // OpenLibrary author data also has IDs
        book.authors = olBook.authors;
        // OpenLibrary accurate to original publish date
        if (olBook.datePublished) book.datePublished = olBook.datePublished;
        // Ids
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
      getGoogleBook(book.ids.googleBooksId)
        .then((updatedBook) => {
          if (updatedBook) book = updatedBook;
        })
        .catch((e) => event.reply("error", parseErr(e)));
    }
    // If just using OpenLibrary, there's no more data to get.
    event.reply("receiveBookData", book);
  });

  ipcMain.on("searchBook", (event, q: string) => {
    if (settings.searchEngines.includes("googleBooks")) {
      searchGoogleBooks(q)
        .then((res) => event.reply("searchBookResults", res))
        .catch((e) => event.reply("error", parseErr(e)));
    } else {
      searchOpenLibrary(q)
        .then((res) => event.reply("searchBookResults", res))
        .catch((e) => event.reply("error", parseErr(e)));
    }
  });

  ipcMain.on("readAllBooks", (event) => {
    readAllBooks(settings.booksDir)
      .then((res) => event.reply("receiveAllBooks", res))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("readBook", (event, authorDir: string, filename: string) => {
    readBook(settings.booksDir, authorDir, filename)
      .then((res) => event.reply("receiveBook", res))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("saveBook", (event, book: Book) => {
    saveBook(settings.booksDir, book)
      .then((res) => event.reply("bookSaved", res))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("editBook", (event, book: Book, authorDir: string, filename: string) => {
    saveBook(settings.booksDir, book, authorDir, filename)
      .then((res) => event.reply("bookSaved", res))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("selectDataDir", async (event) => {
    dialog
      .showOpenDialog(window, {
        defaultPath: settings?.booksDir ?? "",
        properties: ["openDirectory"],
        buttonLabel: "Choose",
      })
      .then((result) => {
        if (result.filePaths[0]?.length) {
          event.reply("dirSelected", result.filePaths[0]);
        }
      });
  });

  ipcMain.on("loadSettings", (event) => {
    try {
      settings = loadSettings();
      settings.appVersion = APP_VERSION;
      event.reply("settingsLoaded", settings);
    } catch (e) {
      event.reply("error", parseErr(e));
    }
  });

  ipcMain.on("saveSettings", (event, newSettings: UserSettings, moveData: boolean) => {
    saveSettings(newSettings, { moveData, oldDir: settings.booksDir }, (err) => {
      if (err) {
        event.reply("error", parseErr(err));
      }
      // Update local settings even if error saving them
      settings = newSettings;
      setWindowTheme(settings.theme);
      event.reply("settingsLoaded", settings);
    });
  });

  ipcMain.on("imageSearch", (event, author: string, title: string, page: number) => {
    if (settings.googleApiKey && settings.googleSearchEngineId) {
      googleImageSearch(settings.googleApiKey, settings.googleSearchEngineId, author, title, page)
        .then((res) => event.reply("imageSearchResults", res))
        .catch((e) => event.reply("error", parseErr(e)));
    }
  });

  ipcMain.on("addBookImage", (event, book: Book, url: string) => {
    addBookImage(settings.booksDir, book, url)
      .then(() => event.reply("bookImageAdded"))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("addBookImageBase64", (event, book: Book, base64: string) => {
    addBookImageBase64(settings.booksDir, book, base64)
      .then(() => event.reply("bookImageBase64Added"))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("deleteBook", (event, book: Book) => {
    deleteBook(settings.booksDir, book)
      .then(() => event.reply("bookDeleted"))
      .catch((e) => event.reply("error", parseErr(e)));
  });

  ipcMain.on("openBooksDir", (_event) => {
    if (settings.booksDir) {
      shell.openPath(settings.booksDir);
    }
  });

  ipcMain.on("openSettingsDir", (_event) => {
    shell.openPath(DATA_PATH);
  });

  ipcMain.on("getPlatform", (event) => {
    event.reply("platform", process.platform);
  });

  // ------- End Bridge -------
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
