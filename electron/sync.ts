import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { app } from "electron";

export interface FileEntry {
  relativePath: string;
  mtime: number;
  size: number;
  hash: string;
}

export interface SyncState {
  path: string;
  name: string;
  autoSyncNew: boolean;
  files: FileEntry[];
  lastSynced: string | null;
}

export interface DiffResult {
  added: FileEntry[];
  modified: FileEntry[];
  deleted: FileEntry[];
}

interface StoreData {
  sources: Record<string, SyncState>;
  syncFrequency: string;
  hotkey: string;
  closeToTray: boolean;
}

const storeFile = () => path.join(app.getPath("userData"), "inklet-sources.json");

function readStore(): StoreData {
  try {
    return JSON.parse(fs.readFileSync(storeFile(), "utf-8"));
  } catch {
    return { sources: {}, syncFrequency: "1d", hotkey: "CommandOrControl+Shift+I", closeToTray: false };
  }
}

function writeStore(data: StoreData) {
  fs.writeFileSync(storeFile(), JSON.stringify(data, null, 2));
}

function hashFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(content).digest("hex");
  } catch {
    return "";
  }
}

export function scanMarkdownFiles(dir: string, base?: string): FileEntry[] {
  const root = base ?? dir;
  const entries: FileEntry[] = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith(".")) continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        entries.push(...scanMarkdownFiles(full, root));
      } else if (item.name.endsWith(".md")) {
        const stat = fs.statSync(full);
        entries.push({
          relativePath: path.relative(root, full),
          mtime: stat.mtimeMs,
          size: stat.size,
          hash: hashFile(full),
        });
      }
    }
  } catch { /* permission errors etc */ }
  return entries;
}

export function computeDiff(prev: FileEntry[], current: FileEntry[]): DiffResult {
  const prevMap = new Map(prev.map((f) => [f.relativePath, f]));
  const currMap = new Map(current.map((f) => [f.relativePath, f]));

  const added: FileEntry[] = [];
  const modified: FileEntry[] = [];
  const deleted: FileEntry[] = [];

  for (const [p, entry] of currMap) {
    const old = prevMap.get(p);
    if (!old) {
      added.push(entry);
    } else if (old.hash !== entry.hash) {
      modified.push(entry);
    }
  }

  for (const [p, entry] of prevMap) {
    if (!currMap.has(p)) deleted.push(entry);
  }

  return { added, modified, deleted };
}

export function getFileContent(sourceDir: string, relativePath: string): string {
  try {
    return fs.readFileSync(path.join(sourceDir, relativePath), "utf-8");
  } catch {
    return "";
  }
}

export interface DetectedVault {
  name: string;
  path: string;
}

export function detectObsidianVaults(): DetectedVault[] {
  try {
    const configPath = path.join(
      process.env.HOME || "",
      "Library/Application Support/obsidian/obsidian.json"
    );
    const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const vaults: DetectedVault[] = [];
    for (const v of Object.values(data.vaults || {}) as any[]) {
      if (v.path && fs.existsSync(v.path)) {
        vaults.push({ name: v.path.split("/").pop() || "vault", path: v.path });
      }
    }
    return vaults;
  } catch {
    return [];
  }
}

export function detectLogseqGraphs(): DetectedVault[] {
  try {
    const home = process.env.HOME || "";
    const candidates = [
      path.join(home, ".logseq/config/config.edn"),
      path.join(home, ".logseq/preferences.json"),
    ];

    for (const c of candidates) {
      if (!fs.existsSync(c)) continue;
      const content = fs.readFileSync(c, "utf-8");

      if (c.endsWith(".json")) {
        const data = JSON.parse(content);
        if (data.graphs) {
          return (data.graphs as any[])
            .filter((g: any) => g.path && fs.existsSync(g.path))
            .map((g: any) => ({ name: g.path.split("/").pop() || "graph", path: g.path }));
        }
      }

      if (c.endsWith(".edn")) {
        const paths = [...content.matchAll(/:graph\/path\s+"([^"]+)"/g)];
        return paths
          .map((m) => m[1])
          .filter((p) => fs.existsSync(p))
          .map((p) => ({ name: p.split("/").pop() || "graph", path: p }));
      }
    }

    const logseqDir = path.join(home, "Documents");
    if (fs.existsSync(logseqDir)) {
      const entries = fs.readdirSync(logseqDir, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory() && fs.existsSync(path.join(logseqDir, e.name, "logseq")))
        .map((e) => ({ name: e.name, path: path.join(logseqDir, e.name) }));
    }

    return [];
  } catch {
    return [];
  }
}

export function loadSources(): StoreData {
  return readStore();
}

export function saveSource(type: string, sourcePath: string): SyncState {
  const store = readStore();
  const files = scanMarkdownFiles(sourcePath);
  const state: SyncState = {
    path: sourcePath,
    name: sourcePath.split("/").pop() || type,
    autoSyncNew: true,
    files,
    lastSynced: null,
  };
  store.sources[type] = state;
  writeStore(store);
  return state;
}

export function removeSource(type: string) {
  const store = readStore();
  delete store.sources[type];
  writeStore(store);
}

export function updateSourceConfig(type: string, config: Partial<SyncState>) {
  const store = readStore();
  if (store.sources[type]) {
    Object.assign(store.sources[type], config);
    writeStore(store);
  }
}

export function getSyncFrequency(): string {
  return readStore().syncFrequency;
}

export function setSyncFrequency(freq: string) {
  const store = readStore();
  store.syncFrequency = freq;
  writeStore(store);
}

export function getHotkey(): string {
  return readStore().hotkey;
}

export function setHotkey(key: string) {
  const store = readStore();
  store.hotkey = key;
  writeStore(store);
}

export function getCloseToTray(): boolean {
  return readStore().closeToTray;
}

export function setCloseToTray(val: boolean) {
  const store = readStore();
  store.closeToTray = val;
  writeStore(store);
}

export function syncSource(type: string): { diff: DiffResult; contents: Record<string, string> } | null {
  const store = readStore();
  const source = store.sources[type];
  if (!source) return null;

  const currentFiles = scanMarkdownFiles(source.path);
  const diff = computeDiff(source.files, currentFiles);

  const contents: Record<string, string> = {};
  for (const f of [...diff.added, ...diff.modified]) {
    contents[f.relativePath] = getFileContent(source.path, f.relativePath);
  }

  source.files = currentFiles;
  source.lastSynced = new Date().toISOString();
  writeStore(store);

  return { diff, contents };
}
