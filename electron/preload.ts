import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  resizeWindow: (width: number, height: number) => {
    ipcRenderer.send("resize-window", { width, height });
  },
});
