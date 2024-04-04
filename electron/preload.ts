import { SearchResult } from "@api/imagesearch";
import { Book } from "@data/book";
import { contextBridge, ipcRenderer } from "electron";
import type { UserSettings } from "../types/global";

function ipcCallback(channel: string, callback: Function) {
  const subscription = (_event: any, ...args: any[]) => callback(...args);
  ipcRenderer.on(channel, subscription);
  return () => {
    ipcRenderer.removeListener(channel, subscription);
  };
}

export const api = {
  loadSettings: () => ipcRenderer.send("loadSettings"),
  saveSettings: (newSettings: UserSettings) => ipcRenderer.send("saveSettings", newSettings),
  settingsLoaded: (callback: Function) => ipcCallback("settingsLoaded", callback),

  updateAvailable: (callback: Function) => ipcCallback("updateAvailable", callback),

  getBookData: (id: string) => ipcRenderer.send("getBookData", id),
  receiveBookData: (callback: Function) => ipcCallback("receiveBookData", callback),

  searchBook: (q: string) => ipcRenderer.send("searchBook", q),
  searchBookResults: (callback: Function) => ipcCallback("searchBookResults", callback),

  readAllBooks: () => ipcRenderer.send("readAllBooks"),
  receiveAllBooks: (callback: Function) => ipcCallback("receiveAllBooks", callback),

  readBook: (authorDir: string, filename: string) => ipcRenderer.send("readBook", authorDir, filename),
  receiveBook: (callback: Function) => ipcCallback("receiveBook", callback),

  saveBook: (book: Book) => ipcRenderer.send("saveBook", book),
  bookSaved: (callback: Function) => ipcCallback("bookSaved", callback),
  editBook: (book: Book, authorDir: string, filename: string) =>
    ipcRenderer.send("editBook", book, authorDir, filename),

  selectDataDir: () => ipcRenderer.send("selectDataDir"),
  dirSelected: (callback: Function) => ipcCallback("dirSelected", callback),

  imageSearch: (author: string, title: string) => ipcRenderer.send("imageSearch", author, title),
  imageSearchResults: (callback: Function) => ipcCallback("imageSearchResults", callback),

  addBookImage: (book: Book, url: string) => ipcRenderer.send("addBookImage", book, url),
  bookImageAdded: (callback: Function) => ipcCallback("bookImageAdded", callback),
};

contextBridge.exposeInMainWorld("electronAPI", api);
