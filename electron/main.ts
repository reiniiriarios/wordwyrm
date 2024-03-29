/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { searchBook } from "../backend/googlebooks";
import { readAllBooks, saveBook } from "../backend/yaml";
import { Book } from "@data/book";
const PORT = 5000;
const DEBUG = process.env.DEBUG === "true";
const BROWSER = process.env.BROWSER === "true";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  if (DEBUG) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }
}

app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // --- Bridge ---

  ipcMain.on("searchBook", (event, q: string) => {
    searchBook(q).then((res) => event.reply("searchBookResults", res));
  });

  ipcMain.on("readAllBooks", (event) => {
    readAllBooks().then((res) => event.reply("receiveAllBooks", res));
  });

  ipcMain.on("saveBook", (event, book: Book) => {
    saveBook(book).then((res) => event.reply("bookSaved", res));
  });

  // --------------
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
