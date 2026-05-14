import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 177,
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
