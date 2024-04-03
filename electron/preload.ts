import { SearchResult } from "@api/imagesearch";
import { Book } from "@data/book";
import { contextBridge, ipcRenderer } from "electron";
import type { UserSettings } from "../types/global";

export const api = {
  loadSettings: () => ipcRenderer.send("loadSettings"),
  saveSettings: (newSettings: UserSettings) => ipcRenderer.send("saveSettings", newSettings),
  settingsLoaded: (callback: Function) =>
    ipcRenderer.on("settingsLoaded", (_event, loadedSettings: UserSettings) => callback(loadedSettings)),

  getBookData: (id: string) => ipcRenderer.send("getBookData", id),
  receiveBookData: (callback: Function) => ipcRenderer.on("receiveBookData", (_event, res: Book) => callback(res)),

  searchBook: (q: string) => ipcRenderer.send("searchBook", q),
  searchBookResults: (callback: Function) =>
    ipcRenderer.on("searchBookResults", (_event, res: Book[]) => callback(res)),

  readAllBooks: () => ipcRenderer.send("readAllBooks"),
  receiveAllBooks: (callback: Function) => ipcRenderer.on("receiveAllBooks", (_event, res: Book[]) => callback(res)),

  readBook: (authorDir: string, filename: string) => ipcRenderer.send("readBook", authorDir, filename),
  receiveBook: (callback: Function) => ipcRenderer.on("receiveBook", (_event, res: Book) => callback(res)),

  saveBook: (book: Book) => ipcRenderer.send("saveBook", book),
  bookSaved: (callback: Function) => ipcRenderer.on("bookSaved", (_event, book: Book) => callback(book)),
  editBook: (book: Book, authorDir: string, filename: string) =>
    ipcRenderer.send("editBook", book, authorDir, filename),

  selectDataDir: () => ipcRenderer.send("selectDataDir"),
  dirSelected: (callback: Function) => ipcRenderer.on("dirSelected", (_event, path: string) => callback(path)),

  imageSearch: (author: string, title: string) => ipcRenderer.send("imageSearch", author, title),
  imageSearchResults: (callback: Function) =>
    ipcRenderer.on("imageSearchResults", (_event, results: SearchResult[] | string) => callback(results)),

  addBookImage: (book: Book, url: string) => ipcRenderer.send("addBookImage", book, url),
  bookImageAdded: (callback: Function) => ipcRenderer.on("bookImageAdded", (_event) => callback()),
};

contextBridge.exposeInMainWorld("electronAPI", api);
