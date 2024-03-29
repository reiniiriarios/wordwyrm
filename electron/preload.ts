import { Book } from "@data/book";
import { contextBridge, ipcRenderer } from "electron";

export const api = {
  searchBook: (q: string) => ipcRenderer.send("searchBook", q),
  searchBookResults: (callback: Function) =>
    ipcRenderer.on("searchBookResults", (_event, res: Book[]) => callback(res)),

  readAllBooks: () => ipcRenderer.send("readAllBooks"),
  receiveAllBooks: (callback: Function) => ipcRenderer.on("receiveAllBooks", (_event, res: Book[]) => callback(res)),

  saveBook: (book: Book) => ipcRenderer.send("saveBook", book),

  selectDataDir: () => ipcRenderer.send("selectDataDir"),
  dirSelected: (callback: Function) => ipcRenderer.on("dirSelected", (_event, path: string) => callback(path)),

  loadSettings: () => ipcRenderer.send("loadSettings"),
  settingsLoaded: (callback: Function) =>
    ipcRenderer.on("settingsLoaded", (_event, settings: object) => callback(settings)),
};

contextBridge.exposeInMainWorld("electronAPI", api);
