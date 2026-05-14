import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  resizeWindow: (width: number, height: number) => {
    ipcRenderer.send("resize-window", { width, height });
  },
  fetchOg: (url: string) => ipcRenderer.invoke("fetch-og", url),
  showManualPopup: (x: number, y: number, deviceId: string | null, duration: string) => {
    ipcRenderer.send("show-manual-popup", { x, y, deviceId, duration });
  },
  closeManualPopup: () => {
    ipcRenderer.send("close-manual-popup");
  },
  sendManualSelection: (deviceId: string, duration: string) => {
    ipcRenderer.send("manual-selection", { deviceId, duration });
  },
  onManualSelection: (cb: (data: { deviceId: string; duration: string }) => void) => {
    ipcRenderer.on("manual-selection", (_e, data) => cb(data));
  },
  onManualPopupClosed: (cb: () => void) => {
    ipcRenderer.on("manual-popup-closed", () => cb());
  },
});
