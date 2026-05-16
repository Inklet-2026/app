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
  showLoginPopup: (x: number, y: number) => {
    ipcRenderer.send("show-login-popup", { x, y });
  },
  showSettingsPopup: (x: number, y: number) => {
    ipcRenderer.send("show-settings-popup", { x, y });
  },
  sendLogin: (username: string) => {
    ipcRenderer.send("login-success", { username });
  },
  onLoginSuccess: (cb: (data: { username: string }) => void) => {
    ipcRenderer.on("login-success", (_e, data) => cb(data));
  },
  openExternal: (url: string) => {
    ipcRenderer.send("open-external", url);
  },
  updateHotkey: (accelerator: string) => {
    ipcRenderer.send("update-hotkey", accelerator);
  },
  updateCloseToTray: (value: boolean) => {
    ipcRenderer.send("update-close-to-tray", value);
  },
  quitApp: () => {
    ipcRenderer.send("quit-app");
  },
  setOpenAtLogin: (value: boolean) => {
    ipcRenderer.send("set-open-at-login", value);
  },
  getOpenAtLogin: () => ipcRenderer.invoke("get-open-at-login"),
});
