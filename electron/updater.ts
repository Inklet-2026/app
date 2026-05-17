import pkg from "electron-updater";
const { autoUpdater } = pkg;
import { BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win: BrowserWindow | null = null;
let updateWin: BrowserWindow | null = null;
let skippedVersions: Set<string> = new Set();

export function initAutoUpdater(mainWindow: BrowserWindow, preloadPath: string) {
  win = mainWindow;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    if (skippedVersions.has(info.version)) return;
    showUpdateDialog(info, preloadPath);
  });

  autoUpdater.on("download-progress", (progress) => {
    if (updateWin && !updateWin.isDestroyed()) {
      updateWin.webContents.send("update-download-progress", progress.percent);
    }
  });

  autoUpdater.on("update-downloaded", () => {
    if (updateWin && !updateWin.isDestroyed()) {
      updateWin.webContents.send("update-downloaded");
    }
  });

  ipcMain.on("update-skip", (_e, version: string) => {
    skippedVersions.add(version);
    if (updateWin && !updateWin.isDestroyed()) { updateWin.close(); updateWin = null; }
  });

  ipcMain.on("update-later", () => {
    if (updateWin && !updateWin.isDestroyed()) { updateWin.close(); updateWin = null; }
  });

  ipcMain.on("update-install", () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on("update-restart", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

export function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(() => {});
}

function showUpdateDialog(info: any, preloadPath: string) {
  if (updateWin && !updateWin.isDestroyed()) { updateWin.close(); }

  const parentBounds = win?.getBounds();
  const w = 340;
  const h = 280;

  updateWin = new BrowserWindow({
    width: w, height: h,
    x: parentBounds ? Math.round(parentBounds.x + (parentBounds.width - w) / 2) : undefined,
    y: parentBounds ? Math.round(parentBounds.y - h - 20) : undefined,
    frame: false, transparent: true, hasShadow: true,
    alwaysOnTop: true, resizable: false, skipTaskbar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true, nodeIntegration: false,
    },
  });

  const params = new URLSearchParams({
    popup: "update",
    version: info.version,
    releaseNotes: typeof info.releaseNotes === "string" ? info.releaseNotes : (info.releaseNotes?.map((n: any) => n.note).join("\n") || ""),
    currentVersion: autoUpdater.currentVersion.version,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    updateWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}?${params}`);
  } else {
    updateWin.loadFile(path.join(__dirname, "../dist/index.html"), { search: params.toString() });
  }

  updateWin.on("closed", () => { updateWin = null; });
}
