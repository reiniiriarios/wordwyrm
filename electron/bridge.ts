import path from "path";
import { BrowserWindow, dialog, ipcMain, nativeTheme, net, protocol, shell } from "electron";

import packageJson from "../package.json";
import BUILD from "./build";

import { UserSettings } from "../types/global";
import { parseErr } from "./error";

import { addBookImage, addBookImageBase64, deleteBook, readAllBooks, readBook, saveBook } from "./data/bookData";
import { loadSettings, saveSettings } from "./data/userData";
import autoUpdate from "./autoUpdate";

import { getGoogleBook, searchGoogleBooks } from "./api/googleBooks";
import { googleImageSearch } from "./api/googleImageSearch";
import { searchOpenLibrary, searchOpenLibraryWorkByISBN } from "./api/openLibrary";

import { DATA_PATH } from "./data/userData";

class Bridge {
  public currentWindow: BrowserWindow;
  public currentSettings: UserSettings;

  public init(settings: UserSettings) {
    this.currentSettings = settings;

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

    // Event handlers

    ipcMain.on("checkVersion", (_event) => {
      autoUpdate.check();
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
        .showOpenDialog(this.currentWindow, {
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
        settings.appVersion = packageJson.version;
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
        this.setWindowTheme(settings.theme);
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
      event.reply("platform", {
        platform: process.platform,
        arch: process.arch,
        pkg: BUILD.package,
        buildPlatform: BUILD.platform,
      });
    });
  }

  public setWindowTheme(theme: string) {
    if (["rosepineDawn", "nordLight"].includes(theme)) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
  }
}

export default new Bridge();
