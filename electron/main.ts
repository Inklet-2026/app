import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win: BrowserWindow | null = null;
let popup: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 179,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 12 },
    transparent: true,
    hasShadow: true,
    alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.on("resize-window", (_e, { width, height }: { width: number; height: number }) => {
  if (win) win.setSize(width, height, true);
});

ipcMain.on("show-manual-popup", (_e, { x, y, deviceId, duration }: { x: number; y: number; deviceId: string | null; duration: string }) => {
  if (popup) { popup.close(); popup = null; }

  const display = screen.getDisplayNearestPoint({ x, y });
  const popupWidth = 200;
  const popupHeight = 260;
  let px = Math.round(x - popupWidth);
  let py = Math.round(y + 8);
  if (py + popupHeight > display.workArea.y + display.workArea.height) {
    py = Math.round(y - popupHeight - 8);
  }

  popup = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x: px,
    y: py,
    frame: false,
    transparent: true,
    hasShadow: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const params = new URLSearchParams({ popup: "manual", deviceId: deviceId ?? "", duration });
  if (process.env.VITE_DEV_SERVER_URL) {
    popup.loadURL(`${process.env.VITE_DEV_SERVER_URL}?${params}`);
  } else {
    popup.loadFile(path.join(__dirname, "../dist/index.html"), { search: params.toString() });
  }

  popup.on("blur", () => {
    if (popup && !popup.isDestroyed()) { popup.close(); popup = null; }
    if (win) win.webContents.send("manual-popup-closed");
  });

  popup.on("closed", () => { popup = null; });
});

ipcMain.on("close-manual-popup", () => {
  if (popup && !popup.isDestroyed()) { popup.close(); popup = null; }
});

ipcMain.on("manual-selection", (_e, data: { deviceId: string; duration: string }) => {
  if (win) win.webContents.send("manual-selection", data);
  if (popup && !popup.isDestroyed()) { popup.close(); popup = null; }
});

ipcMain.handle("fetch-og", async (_e, url: string) => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; InkletPortal/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    function getMetaContent(property: string): string | null {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${property}["']`, "i"),
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m?.[1]) return m[1];
      }
      return null;
    }

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const hostname = new URL(url).hostname;

    return {
      title: getMetaContent("og:title") || titleMatch?.[1]?.trim() || hostname,
      description: getMetaContent("og:description") || getMetaContent("description") || "",
      image: getMetaContent("og:image") || null,
      url,
      hostname,
    };
  } catch {
    const hostname = new URL(url).hostname;
    return { title: hostname, description: "", image: null, url, hostname };
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
