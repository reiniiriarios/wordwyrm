import { contextBridge, ipcRenderer } from "electron";
import type { UserSettings } from "../types/global";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => void;

function ipcCallback(channel: string, callback: Callback) {
  const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
  ipcRenderer.on(channel, subscription);
  return () => {
    ipcRenderer.removeListener(channel, subscription);
  };
}

export const api = {
  env: process.env.WYRM_ENV || "prod",
  platform: process.platform,
  arch: process.arch,
  fileBrowser:
    process.platform === "darwin" ? "Finder" : process.platform === "win32" ? "File Explorer" : "File Manager",

  error: (callback: Callback) => ipcCallback("error", callback),

  loadSettings: () => ipcRenderer.send("loadSettings"),
  saveSettings: (newSettings: UserSettings, moveData: boolean) =>
    ipcRenderer.send("saveSettings", newSettings, moveData),
  settingsLoaded: (callback: Callback) => ipcCallback("settingsLoaded", callback),

  checkVersion: () => ipcRenderer.send("checkVersion"),
  updateAvailable: (callback: Callback) => ipcCallback("updateAvailable", callback),

  getBookData: (book: Book) => ipcRenderer.send("getBookData", book),
  receiveBookData: (callback: Callback) => ipcCallback("receiveBookData", callback),

  searchBook: (q: string) => ipcRenderer.send("searchBook", q),
  searchBookResults: (callback: Callback) => ipcCallback("searchBookResults", callback),

  readAllBooks: () => ipcRenderer.send("readAllBooks"),
  receiveAllBooks: (callback: Callback) => ipcCallback("receiveAllBooks", callback),

  readBook: (authorDir: string, filename: string) => ipcRenderer.send("readBook", authorDir, filename),
  receiveBook: (callback: Callback) => ipcCallback("receiveBook", callback),

  saveBook: (book: Partial<Book>) => ipcRenderer.send("saveBook", book),
  bookSaved: (callback: Callback) => ipcCallback("bookSaved", callback),
  editBook: (book: Book, authorDir: string, filename: string) =>
    ipcRenderer.send("editBook", book, authorDir, filename),

  selectDataDir: () => ipcRenderer.send("selectDataDir"),
  dirSelected: (callback: Callback) => ipcCallback("dirSelected", callback),

  imageSearch: (author: string, title: string, page: number) => ipcRenderer.send("imageSearch", author, title, page),
  imageSearchResults: (callback: Callback) => ipcCallback("imageSearchResults", callback),

  addBookImage: (book: Book, url: string) => ipcRenderer.send("addBookImage", book, url),
  bookImageAdded: (callback: Callback) => ipcCallback("bookImageAdded", callback),
  addBookImageBase64: (book: Book, base64: string) => ipcRenderer.send("addBookImageBase64", book, base64),
  bookImageBase64Added: (callback: Callback) => ipcCallback("bookImageBase64Added", callback),

  deleteBook: (book: Book) => ipcRenderer.send("deleteBook", book),
  bookDeleted: (callback: Callback) => ipcCallback("bookDeleted", callback),

  openSettingsDir: () => ipcRenderer.send("openSettingsDir"),
  openBooksDir: () => ipcRenderer.send("openBooksDir"),
  openLogsDir: () => ipcRenderer.send("openLogsDir"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
