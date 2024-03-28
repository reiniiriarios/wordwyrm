import { contextBridge, ipcRenderer } from "electron";

export const api = {
  searchBook: (q: string) => ipcRenderer.send("searchBook", q),
  searchBookResults: (callback: Function) => ipcRenderer.on("searchBookResults", (_event, res) => callback(res)),
};

contextBridge.exposeInMainWorld("electronAPI", api);
