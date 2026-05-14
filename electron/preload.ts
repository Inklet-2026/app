import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  resizeWindow: (width: number, height: number) => {
    ipcRenderer.send("resize-window", { width, height });
  },
  fetchOg: (url: string) => ipcRenderer.invoke("fetch-og", url),
});
