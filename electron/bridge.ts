import path from "path";
import { BrowserWindow, dialog, ipcMain, nativeTheme, net, protocol, shell } from "electron";

import packageJson from "../package.json";
import BUILD from "./build";
import ENV from "../env.cjs";

import { UserSettings } from "../types/global";
import { parseErr } from "./error";

import {
  addBookImage,
  addBookImageBase64,
  addGooglePlusOpenLibraryData,
  deleteBook,
  readAllBooks,
  readBook,
  saveBook,
} from "./data/bookData";
import { loadSettings, saveSettings } from "./data/userData";
import autoUpdate from "./autoUpdate";

import { getGoogleBook, searchGoogleBooks } from "./api/googleBooks";
import { googleImageSearch } from "./api/googleImageSearch";
import { searchOpenLibrary } from "./api/openLibrary";

import { DATA_PATH } from "./data/userData";

const UPDATE_EVERY = 86400000000; // 1d in ms

class Bridge {
  public currentWindow: BrowserWindow;
  public currentSettings: UserSettings;

  public init(settings: UserSettings) {
    this.currentSettings = settings;

    // Protocol handlers

    protocol.handle("localfile", (request) => {
      let url = request.url.slice("localfile://".length).replace(/\\/g, "/").replace(/ /g, "%20");
      if (url.charAt(0) !== "/") {
        url = `/${url}`;
      }
      return net.fetch(`file://${url}`);
    });

    protocol.handle("bookimage", (request) => {
      let url = path
        .join(this.currentSettings.booksDir, request.url.slice("bookimage://".length))
        .replace(/\\/g, "/")
        .replace(/ /g, "%20");
      if (url.charAt(0) !== "/") {
        url = `/${url}`;
      }
      return net.fetch(`file://${url}`);
    });

    // Event handlers

    ipcMain.on("checkVersion", (_event) => {
      if (+(this.currentSettings.lastUpdateCheck ?? 0) + UPDATE_EVERY < new Date().getTime()) {
        autoUpdate.check();
      }
    });

    ipcMain.on("getBookData", async (event, book: Book) => {
      // If using both search engines, get the Google Books data, then supplement with OpenLibrary.
      if (
        this.currentSettings.searchEngines.includes("googleBooks") &&
        this.currentSettings.searchEngines.includes("openLibrary")
      ) {
        try {
          book = await addGooglePlusOpenLibraryData(book);
        } catch (e) {
          event.reply("error", parseErr(e));
        }
      } else if (this.currentSettings.searchEngines.includes("googleBooks")) {
        // If just using Google Books, fetch full data.
        getGoogleBook(book.ids.googleBooksId)
          .then((updatedBook) => {
            if (updatedBook) {
              book = updatedBook;
            }
          })
          .catch((e) => event.reply("error", parseErr(e)));
      }
      // If just using OpenLibrary, there's no more data to get.
      event.reply("receiveBookData", book);
    });

    ipcMain.on("searchBook", (event, q: string) => {
      if (this.currentSettings.searchEngines.includes("googleBooks")) {
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
      if (this.currentSettings.booksDir) {
        readAllBooks(this.currentSettings.booksDir)
          .then((res) => event.reply("receiveAllBooks", res))
          .catch((e) => event.reply("error", parseErr(e)));
      }
    });

    ipcMain.on("readBook", (event, authorDir: string, filename: string) => {
      readBook(this.currentSettings.booksDir, authorDir, filename)
        .then((res) => event.reply("receiveBook", res))
        .catch((e) => event.reply("error", parseErr(e)));
    });

    ipcMain.on("saveBook", (event, book: Book) => {
      saveBook(this.currentSettings.booksDir, book)
        .then((res) => event.reply("bookSaved", res))
        .catch((e) => event.reply("error", parseErr(e)));
    });

    ipcMain.on("editBook", (event, book: Book, authorDir: string, filename: string) => {
      saveBook(this.currentSettings.booksDir, book, authorDir, filename)
        .then((res) => event.reply("bookSaved", res))
        .catch((e) => event.reply("error", parseErr(e)));
    });

    ipcMain.on("selectDataDir", async (event) => {
      dialog
        .showOpenDialog(this.currentWindow, {
          defaultPath: this.currentSettings.booksDir ?? "",
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
        this.currentSettings = loadSettings();
        this.currentSettings.appVersion = packageJson.version;
        event.reply("settingsLoaded", this.currentSettings);
      } catch (e) {
        event.reply("error", parseErr(e));
      }
    });

    ipcMain.on("saveSettings", (event, newSettings: UserSettings, moveData: boolean) => {
      saveSettings(newSettings, { moveData, oldDir: this.currentSettings.booksDir }, (err) => {
        if (err) {
          event.reply("error", parseErr(err));
        }
        // Update local settings even if error saving them
        this.currentSettings = newSettings;
        this.setWindowTheme(this.currentSettings.theme);
        event.reply("settingsLoaded", this.currentSettings);
      });
    });

    ipcMain.on("imageSearch", (event, author: string, title: string, page: number) => {
      if (this.currentSettings.googleApiKey && this.currentSettings.googleSearchEngineId) {
        googleImageSearch(
          this.currentSettings.googleApiKey,
          this.currentSettings.googleSearchEngineId,
          author,
          title,
          page,
        )
          .then((res) => event.reply("imageSearchResults", res))
          .catch((e) => event.reply("error", parseErr(e)));
      }
    });

    ipcMain.on("addBookImage", (event, book: Book, url: string) => {
      addBookImage(this.currentSettings.booksDir, book, url)
        .then(() => event.reply("bookImageAdded"))
        .catch((e) => event.reply("error", parseErr(e)));
    });

    ipcMain.on("addBookImageBase64", (event, book: Book, base64: string) => {
      addBookImageBase64(this.currentSettings.booksDir, book, base64)
        .then(() => event.reply("bookImageBase64Added"))
        .catch((e) => event.reply("error", parseErr(e)));
    });

    ipcMain.on("deleteBook", (event, book: Book) => {
      deleteBook(this.currentSettings.booksDir, book)
        .then(() => event.reply("bookDeleted"))
        .catch((e) => event.reply("error", parseErr(e)));
    });

    ipcMain.on("openBooksDir", (_event) => {
      if (this.currentSettings.booksDir) {
        shell.openPath(this.currentSettings.booksDir);
      }
    });

    ipcMain.on("openSettingsDir", (_event) => {
      shell.openPath(DATA_PATH);
    });

    ipcMain.on("openLogsDir", (_event) => {
      shell.openPath(path.join(DATA_PATH, "logs"));
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
