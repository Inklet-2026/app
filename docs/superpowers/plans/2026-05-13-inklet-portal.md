# Inklet Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Tauri v2 desktop app that lets users push content to Inklet e-ink devices via a hotkey-activated floating input bar, with auto AI routing or manual device targeting.

**Architecture:** Single-window Tauri v2 app with two modes — a mini input bar (400x56) and an expanded panel (420x520) that grows outward from it. React frontend handles UI, Zustand for state, all business data via REST API. Rust layer handles window management, global shortcuts, and system tray.

**Tech Stack:** Tauri v2, React 18, TypeScript, Vite, Tailwind CSS v3, Zustand, Vitest, pnpm

---

## File Map

```
inklet-app/
├── src-tauri/
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/default.json
│   └── src/
│       ├── main.rs
│       └── lib.rs
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/index.ts
│   ├── api/
│   │   ├── client.ts
│   │   └── mock.ts
│   ├── stores/
│   │   ├── appStore.ts
│   │   ├── authStore.ts
│   │   ├── pushStore.ts
│   │   ├── historyStore.ts
│   │   ├── deviceStore.ts
│   │   └── sourceStore.ts
│   ├── hooks/useTauriWindow.ts
│   ├── components/
│   │   ├── InputBar.tsx
│   │   ├── PushModeSelector.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── BottomNav.tsx
│   ├── views/
│   │   ├── HomeView.tsx
│   │   ├── HistoryView.tsx
│   │   ├── DevicesView.tsx
│   │   ├── SourcesView.tsx
│   │   └── SettingsView.tsx
│   └── styles/globals.css
├── tests/
│   ├── setup.ts
│   └── stores/
│       ├── appStore.test.ts
│       ├── pushStore.test.ts
│       ├── historyStore.test.ts
│       ├── deviceStore.test.ts
│       └── sourceStore.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
└── vitest.config.ts
```

---

### Task 1: Project Scaffolding

**Files:** Create all config files, entry points, Tauri Rust boilerplate

- [ ] **Step 1: Initialize and install dependencies**

```bash
cd /Users/clck/Desktop/Workspace/inklet-app
pnpm init
pnpm add react react-dom zustand @tauri-apps/api @tauri-apps/plugin-global-shortcut @tauri-apps/plugin-store
pnpm add -D typescript vite @vitejs/plugin-react @types/react @types/react-dom tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @tauri-apps/cli
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
  },
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create tailwind.config.ts and postcss.config.js**

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

`postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create vitest.config.ts and tests/setup.ts**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
```

`tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
  emit: vi.fn(),
}));

vi.mock("@tauri-apps/api/window", () => {
  const mock = {
    setSize: vi.fn(() => Promise.resolve()),
    setAlwaysOnTop: vi.fn(() => Promise.resolve()),
    setDecorations: vi.fn(() => Promise.resolve()),
    center: vi.fn(() => Promise.resolve()),
    show: vi.fn(() => Promise.resolve()),
    hide: vi.fn(() => Promise.resolve()),
    setFocus: vi.fn(() => Promise.resolve()),
    isVisible: vi.fn(() => Promise.resolve(true)),
    onFocusChanged: vi.fn(() => Promise.resolve(() => {})),
  };
  return {
    getCurrentWebviewWindow: vi.fn(() => mock),
    LogicalSize: vi.fn((w: number, h: number) => ({ width: w, height: h })),
  };
});

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(() => Promise.resolve(null)),
      set: vi.fn(() => Promise.resolve()),
      save: vi.fn(() => Promise.resolve()),
    })
  ),
}));
```

- [ ] **Step 7: Create index.html, src/main.tsx, src/App.tsx, src/styles/globals.css**

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inklet Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx` (placeholder):

```tsx
export default function App() {
  return <div className="p-4 text-center text-gray-700">Inklet Portal</div>;
}
```

`src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
}
```

- [ ] **Step 8: Create Tauri Rust files**

`src-tauri/Cargo.toml`:

```toml
[package]
name = "inklet-portal"
version = "0.1.0"
edition = "2021"

[lib]
name = "inklet_portal_lib"
crate-type = ["lib", "cdylib", "staticlib"]

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-global-shortcut = "2"
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[build-dependencies]
tauri-build = { version = "2", features = [] }
```

`src-tauri/build.rs`:

```rust
fn main() {
    tauri_build::build()
}
```

`src-tauri/src/main.rs`:

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    inklet_portal_lib::run()
}
```

`src-tauri/src/lib.rs` (minimal, expanded in Task 4):

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

`src-tauri/tauri.conf.json`:

```json
{
  "productName": "Inklet Portal",
  "version": "0.1.0",
  "identifier": "com.inklet.portal",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Inklet Portal",
        "width": 400,
        "height": 56,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true,
        "center": true,
        "visible": false,
        "resizable": false,
        "shadow": false
      }
    ],
    "security": { "csp": null }
  }
}
```

`src-tauri/capabilities/default.json`:

```json
{
  "identifier": "default",
  "description": "Default capabilities for Inklet Portal",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "core:window:allow-set-size",
    "core:window:allow-set-decorations",
    "core:window:allow-set-always-on-top",
    "core:window:allow-center",
    "core:window:allow-set-focus",
    "core:window:allow-is-visible",
    "core:window:allow-set-position",
    "global-shortcut:allow-register",
    "global-shortcut:allow-unregister",
    "global-shortcut:allow-is-registered",
    "store:allow-get",
    "store:allow-set",
    "store:allow-save",
    "store:allow-load"
  ]
}
```

- [ ] **Step 9: Add scripts to package.json**

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "tauri": "tauri"
  }
}
```

- [ ] **Step 10: Verify frontend dev server**

Run: `pnpm dev`
Expected: Vite starts on http://localhost:1420

- [ ] **Step 11: Verify tests run**

Run: `pnpm test`
Expected: Exits with 0 tests (no test files yet)

- [ ] **Step 12: Commit**

```bash
git init
echo "node_modules/\ndist/\nsrc-tauri/target/\n.superpowers/" > .gitignore
git add .
git commit -m "feat: scaffold Tauri v2 + React + TypeScript project"
```

---

### Task 2: Domain Types

**Files:** Create `src/types/index.ts`

- [ ] **Step 1: Create all shared types**

`src/types/index.ts`:

```ts
export type WindowMode = "mini" | "expanded";
export type ActiveTab = "home" | "history" | "devices" | "sources" | "settings";
export type PushMode = "auto" | "manual";
export type Duration = "10m" | "1h" | "3h" | "12h" | "1d" | "3d" | "1w";
export type PushStatus = "queued" | "distributed";
export type ContentType = "text" | "url" | "image" | "file";
export type DeviceStatus = "online" | "offline";
export type SourceProvider = "notion" | "craft" | "obsidian";

export const DURATION_LABELS: Record<Duration, string> = {
  "10m": "10 min", "1h": "1 hour", "3h": "3 hours",
  "12h": "12 hours", "1d": "1 day", "3d": "3 days", "1w": "1 week",
};

export interface PushRecord {
  id: string;
  content: string;
  contentType: ContentType;
  pushMode: PushMode;
  status: PushStatus;
  createdAt: string;
  deviceId: string | null;
  deviceName: string | null;
  duration: Duration | null;
  expiresAt: string | null;
}

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  currentContent: string | null;
  manualUntil: string | null;
}

export interface ContentSource {
  id: string;
  provider: SourceProvider;
  connected: boolean;
  label: string;
  syncItems: SyncItem[];
}

export interface SyncItem {
  id: string;
  name: string;
  enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  plan: string;
}

export interface PushRequest {
  content: string;
  contentType: ContentType;
  pushMode: PushMode;
  deviceId: string | null;
  duration: Duration | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: add domain types"
```

---

### Task 3: API Client with Mock Data

**Files:** Create `src/api/mock.ts`, `src/api/client.ts`

- [ ] **Step 1: Create mock data**

`src/api/mock.ts`:

```ts
import type { PushRecord, Device, ContentSource, User } from "../types";

export const mockUser: User = {
  id: "u1", email: "user@inklet.com", name: "Demo User",
  avatarUrl: null, plan: "Pro",
};

export const mockDevices: Device[] = [
  { id: "d1", name: "Study", status: "online", currentContent: "Meeting notes", manualUntil: null },
  { id: "d2", name: "Living Room", status: "online", currentContent: "Weather", manualUntil: null },
  { id: "d3", name: "Desk", status: "offline", currentContent: null, manualUntil: null },
];

export const mockPushHistory: PushRecord[] = [
  {
    id: "p1", content: "Meeting notes - Q2 planning", contentType: "text",
    pushMode: "auto", status: "distributed",
    createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    deviceId: null, deviceName: null, duration: null, expiresAt: null,
  },
  {
    id: "p2", content: "Figma screenshot - new homepage", contentType: "image",
    pushMode: "manual", status: "distributed",
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    deviceId: "d3", deviceName: "Desk", duration: "3h",
    expiresAt: new Date(Date.now() + 7_200_000).toISOString(),
  },
  {
    id: "p3", content: "https://example.com/reading-list", contentType: "url",
    pushMode: "auto", status: "queued",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    deviceId: null, deviceName: null, duration: null, expiresAt: null,
  },
];

export const mockSources: ContentSource[] = [
  {
    id: "s1", provider: "notion", connected: true, label: "Notion",
    syncItems: [
      { id: "si1", name: "Work Notes", enabled: true },
      { id: "si2", name: "Reading List", enabled: false },
    ],
  },
  { id: "s2", provider: "obsidian", connected: false, label: "Obsidian", syncItems: [] },
  { id: "s3", provider: "craft", connected: false, label: "Craft", syncItems: [] },
];
```

- [ ] **Step 2: Create API client**

`src/api/client.ts`:

```ts
import type { PushRecord, PushRequest, Device, ContentSource, User } from "../types";
import { mockUser, mockDevices, mockPushHistory, mockSources } from "./mock";

const USE_MOCK = true;
const BASE_URL = "";
let authToken: string | null = null;

async function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK) { await delay(); return { token: "mock-token", user: mockUser }; }
    return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },

  async getUser(): Promise<User> {
    if (USE_MOCK) { await delay(); return mockUser; }
    return request("/user");
  },

  async pushContent(req: PushRequest): Promise<PushRecord> {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: `p${Date.now()}`, content: req.content, contentType: req.contentType,
        pushMode: req.pushMode, status: "queued", createdAt: new Date().toISOString(),
        deviceId: req.deviceId,
        deviceName: req.deviceId ? mockDevices.find((d) => d.id === req.deviceId)?.name ?? null : null,
        duration: req.duration, expiresAt: null,
      };
    }
    return request("/push", { method: "POST", body: JSON.stringify(req) });
  },

  async getHistory(page = 1): Promise<{ records: PushRecord[]; total: number }> {
    if (USE_MOCK) { await delay(); return { records: mockPushHistory, total: mockPushHistory.length }; }
    return request(`/push/history?page=${page}`);
  },

  async getDevices(): Promise<Device[]> {
    if (USE_MOCK) { await delay(); return mockDevices; }
    return request("/devices");
  },

  async getSources(): Promise<ContentSource[]> {
    if (USE_MOCK) { await delay(); return mockSources; }
    return request("/sources");
  },

  async toggleSyncItem(sourceId: string, itemId: string, enabled: boolean): Promise<void> {
    if (USE_MOCK) { await delay(); return; }
    await request(`/sources/${sourceId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ enabled }) });
  },

  async connectSource(provider: string): Promise<ContentSource> {
    if (USE_MOCK) { await delay(); return { ...mockSources.find((s) => s.provider === provider)!, connected: true }; }
    return request("/sources/connect", { method: "POST", body: JSON.stringify({ provider }) });
  },

  async disconnectSource(sourceId: string): Promise<void> {
    if (USE_MOCK) { await delay(); return; }
    await request(`/sources/${sourceId}/disconnect`, { method: "POST" });
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add src/api/
git commit -m "feat: add API client with mock data layer"
```

---

### Task 4: Tauri Backend — Window, Tray, Shortcuts

**Files:** Modify `src-tauri/src/lib.rs`

- [ ] **Step 1: Implement full Rust backend**

Replace `src-tauri/src/lib.rs`:

```rust
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
    menu::{Menu, MenuItem},
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[tauri::command]
fn set_window_mode(window: tauri::WebviewWindow, mode: &str) -> Result<(), String> {
    match mode {
        "mini" => {
            window.set_size(tauri::LogicalSize::new(400.0, 56.0)).map_err(|e| e.to_string())?;
            window.set_always_on_top(true).map_err(|e| e.to_string())?;
            window.center().map_err(|e| e.to_string())?;
        }
        "expanded" => {
            window.set_size(tauri::LogicalSize::new(420.0, 520.0)).map_err(|e| e.to_string())?;
            window.center().map_err(|e| e.to_string())?;
        }
        _ => return Err(format!("Invalid mode: {mode}")),
    }
    Ok(())
}

#[tauri::command]
fn show_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn hide_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())?;
    Ok(())
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &settings, &quit])?;

    TrayIconBuilder::new()
        .tooltip("Inklet Portal")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "settings" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                    let _ = w.emit("navigate", "settings");
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up, ..
            } = event {
                let app = tray.app_handle();
                if let Some(w) = app.get_webview_window("main") {
                    if w.is_visible().unwrap_or(false) {
                        let _ = w.hide();
                    } else {
                        let _ = w.show();
                        let _ = w.set_focus();
                    }
                }
            }
        })
        .build(app)?;
    Ok(())
}

fn setup_shortcut(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let shortcut = "CmdOrCtrl+L".parse::<Shortcut>()?;
    app.global_shortcut().on_shortcut(shortcut, |app, _scut, event| {
        if event.state == ShortcutState::Pressed {
            if let Some(w) = app.get_webview_window("main") {
                if w.is_visible().unwrap_or(false) {
                    let _ = w.hide();
                } else {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
        }
    })?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![set_window_mode, show_window, hide_window])
        .setup(|app| {
            setup_tray(app)?;
            setup_shortcut(app)?;
            if let Some(w) = app.get_webview_window("main") {
                let w2 = w.clone();
                w.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        let _ = w2.hide();
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd src-tauri && cargo check`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add src-tauri/
git commit -m "feat: add window management, tray, and global shortcut"
```

---

### Task 5: App Store, Window Hook & App Shell

**Files:** Create `src/stores/appStore.ts`, `src/hooks/useTauriWindow.ts`, `src/components/BottomNav.tsx`. Modify `src/App.tsx`, `src/styles/globals.css`. Test: `tests/stores/appStore.test.ts`

- [ ] **Step 1: Write appStore tests**

`tests/stores/appStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../src/stores/appStore";

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState({ mode: "mini", activeTab: "home" });
  });

  it("starts in mini mode with home tab", () => {
    const s = useAppStore.getState();
    expect(s.mode).toBe("mini");
    expect(s.activeTab).toBe("home");
  });

  it("toggles mode", () => {
    useAppStore.getState().toggleMode();
    expect(useAppStore.getState().mode).toBe("expanded");
    useAppStore.getState().toggleMode();
    expect(useAppStore.getState().mode).toBe("mini");
  });

  it("setActiveTab switches to expanded", () => {
    useAppStore.getState().setActiveTab("devices");
    const s = useAppStore.getState();
    expect(s.activeTab).toBe("devices");
    expect(s.mode).toBe("expanded");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test -- tests/stores/appStore.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Create appStore**

`src/stores/appStore.ts`:

```ts
import { create } from "zustand";
import type { WindowMode, ActiveTab } from "../types";

interface AppState {
  mode: WindowMode;
  activeTab: ActiveTab;
  setMode: (mode: WindowMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  toggleMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "mini",
  activeTab: "home",
  setMode: (mode) => set({ mode }),
  setActiveTab: (tab) => set({ activeTab: tab, mode: "expanded" }),
  toggleMode: () => set((s) => ({ mode: s.mode === "mini" ? "expanded" : "mini" })),
}));
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test -- tests/stores/appStore.test.ts`
Expected: 3 tests PASS

- [ ] **Step 5: Create useTauriWindow hook**

`src/hooks/useTauriWindow.ts`:

```ts
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useAppStore } from "../stores/appStore";

export function useTauriWindow() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  useEffect(() => {
    invoke("set_window_mode", { mode }).catch(console.error);
  }, [mode]);

  useEffect(() => {
    const unlisten = listen<string>("navigate", (event) => {
      if (event.payload === "settings") setActiveTab("settings");
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [setActiveTab]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMode("mini");
        invoke("hide_window").catch(console.error);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setMode]);
}
```

- [ ] **Step 6: Create BottomNav**

`src/components/BottomNav.tsx`:

```tsx
import { useAppStore } from "../stores/appStore";
import type { ActiveTab } from "../types";

const tabs: { key: ActiveTab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "history", label: "History" },
  { key: "devices", label: "Devices" },
  { key: "sources", label: "Sources" },
  { key: "settings", label: "Settings" },
];

export default function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav className="flex justify-around items-center border-t border-gray-100 px-4 py-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === tab.key ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium">
            {tab.label.slice(0, 2)}
          </span>
          <span className="text-[10px]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 7: Build App.tsx shell**

Replace `src/App.tsx`:

```tsx
import { useAppStore } from "./stores/appStore";
import { useTauriWindow } from "./hooks/useTauriWindow";
import BottomNav from "./components/BottomNav";

function ViewContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <p className="text-sm text-gray-400">{activeTab} view</p>
    </div>
  );
}

export default function App() {
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);

  useTauriWindow();

  return (
    <div
      className={`flex flex-col bg-white transition-all duration-200 ease-out ${
        mode === "mini" ? "rounded-xl shadow-lg" : "rounded-2xl shadow-xl"
      }`}
      style={{ height: "100vh" }}
    >
      {mode === "expanded" && (
        <div className="text-center pt-5 pb-2">
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">inklet</h1>
          <p className="text-[11px] text-gray-400">Portal</p>
        </div>
      )}

      <div className="px-4 py-2">
        <div
          className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 cursor-text"
          onClick={() => { if (mode === "mini") toggleMode(); }}
        >
          <span className="text-gray-300 text-sm">+</span>
          <span className="flex-1 text-gray-400 text-sm">Push content to device...</span>
          <span className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs">
            ↑
          </span>
        </div>
      </div>

      {mode === "expanded" && (
        <>
          <ViewContent />
          <BottomNav />
        </>
      )}
    </div>
  );
}
```

This is a placeholder — InputBar replaces the inline input div in Task 7.

- [ ] **Step 8: Verify in browser**

Run: `pnpm dev`
Open http://localhost:1420. Should render the input bar. (Tauri invoke will fail in browser, but UI renders.)

- [ ] **Step 9: Commit**

```bash
git add src/ tests/
git commit -m "feat: add app shell with mode switching, bottom nav, and window hook"
```

---

### Task 6: Auth Store

**Files:** Create `src/stores/authStore.ts`

- [ ] **Step 1: Create authStore**

`src/stores/authStore.ts`:

```ts
import { create } from "zustand";
import { api, setAuthToken } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await api.login(email, password);
      setAuthToken(token);
      set({ token, user, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Login failed");
    }
  },
  logout: () => { setAuthToken(null); set({ user: null, token: null }); },
  loadToken: (token) => {
    setAuthToken(token);
    set({ token });
    api.getUser().then((user) => set({ user })).catch(() => {
      setAuthToken(null);
      set({ token: null });
    });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/authStore.ts
git commit -m "feat: add auth store"
```

---

### Task 7: Push Store & InputBar

**Files:** Create `src/stores/pushStore.ts`, `src/components/InputBar.tsx`, `src/components/PushModeSelector.tsx`, `src/components/StatusIndicator.tsx`. Test: `tests/stores/pushStore.test.ts`. Modify: `src/App.tsx`

- [ ] **Step 1: Write pushStore tests**

`tests/stores/pushStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePushStore } from "../src/stores/pushStore";

vi.mock("../src/api/client", () => ({
  api: {
    pushContent: vi.fn(() =>
      Promise.resolve({
        id: "p1", content: "test", contentType: "text", pushMode: "auto",
        status: "queued", createdAt: new Date().toISOString(),
        deviceId: null, deviceName: null, duration: null, expiresAt: null,
      })
    ),
  },
}));

describe("pushStore", () => {
  beforeEach(() => {
    usePushStore.setState({
      content: "", pushMode: "auto", selectedDeviceId: null,
      selectedDuration: "1h", isSubmitting: false, lastResult: null,
    });
  });

  it("starts with empty content in auto mode", () => {
    const s = usePushStore.getState();
    expect(s.content).toBe("");
    expect(s.pushMode).toBe("auto");
  });

  it("does not submit empty content", async () => {
    await usePushStore.getState().submit();
    expect(usePushStore.getState().lastResult).toBeNull();
  });

  it("submits and resets", async () => {
    usePushStore.getState().setContent("test note");
    await usePushStore.getState().submit();
    const s = usePushStore.getState();
    expect(s.content).toBe("");
    expect(s.lastResult).not.toBeNull();
  });

  it("detects URL content type", () => {
    usePushStore.getState().setContent("https://example.com");
    expect(usePushStore.getState().detectedContentType).toBe("url");
  });

  it("detects text content type", () => {
    usePushStore.getState().setContent("just notes");
    expect(usePushStore.getState().detectedContentType).toBe("text");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test -- tests/stores/pushStore.test.ts`
Expected: FAIL

- [ ] **Step 3: Create pushStore**

`src/stores/pushStore.ts`:

```ts
import { create } from "zustand";
import { api } from "../api/client";
import type { PushMode, Duration, ContentType, PushRecord } from "../types";

function detectContentType(content: string): ContentType {
  if (/^https?:\/\//i.test(content.trim())) return "url";
  return "text";
}

interface PushState {
  content: string;
  pushMode: PushMode;
  selectedDeviceId: string | null;
  selectedDuration: Duration;
  isSubmitting: boolean;
  lastResult: PushRecord | null;
  detectedContentType: ContentType;
  setContent: (content: string) => void;
  setPushMode: (mode: PushMode) => void;
  setSelectedDeviceId: (id: string | null) => void;
  setSelectedDuration: (duration: Duration) => void;
  submit: () => Promise<void>;
  clearResult: () => void;
}

export const usePushStore = create<PushState>((set, get) => ({
  content: "",
  pushMode: "auto",
  selectedDeviceId: null,
  selectedDuration: "1h",
  isSubmitting: false,
  lastResult: null,
  detectedContentType: "text",

  setContent: (content) => set({ content, detectedContentType: detectContentType(content) }),
  setPushMode: (pushMode) => set({ pushMode }),
  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),
  setSelectedDuration: (selectedDuration) => set({ selectedDuration }),

  submit: async () => {
    const { content, pushMode, selectedDeviceId, selectedDuration } = get();
    if (!content.trim()) return;
    set({ isSubmitting: true });
    try {
      const result = await api.pushContent({
        content,
        contentType: detectContentType(content),
        pushMode,
        deviceId: pushMode === "manual" ? selectedDeviceId : null,
        duration: pushMode === "manual" ? selectedDuration : null,
      });
      set({
        content: "", pushMode: "auto", selectedDeviceId: null,
        selectedDuration: "1h", isSubmitting: false, lastResult: result,
        detectedContentType: "text",
      });
    } catch {
      set({ isSubmitting: false });
    }
  },

  clearResult: () => set({ lastResult: null }),
}));
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test -- tests/stores/pushStore.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: Create InputBar**

`src/components/InputBar.tsx`:

```tsx
import { useRef, useEffect } from "react";
import { usePushStore } from "../stores/pushStore";
import { useAppStore } from "../stores/appStore";

export default function InputBar() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const content = usePushStore((s) => s.content);
  const setContent = usePushStore((s) => s.setContent);
  const isSubmitting = usePushStore((s) => s.isSubmitting);
  const submit = usePushStore((s) => s.submit);

  useEffect(() => {
    if (mode === "expanded") ref.current?.focus();
  }, [mode]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  if (mode === "mini") {
    return (
      <div
        className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 cursor-text"
        onClick={toggleMode}
      >
        <span className="text-gray-300 text-sm">+</span>
        <span className="flex-1 text-gray-400 text-sm truncate">Push content to device...</span>
        <span className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs">↑</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
      <span className="text-gray-300 text-sm mt-1">+</span>
      <textarea
        ref={ref}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Push content to device..."
        rows={1}
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none min-h-[20px] max-h-[80px]"
      />
      <button
        onClick={submit}
        disabled={isSubmitting || !content.trim()}
        className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs shrink-0 disabled:opacity-40"
      >
        {isSubmitting ? "..." : "↑"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5a: Create deviceStore (needed by PushModeSelector)**

`src/stores/deviceStore.ts`:

```ts
import { create } from "zustand";
import { api } from "../api/client";
import type { Device } from "../types";

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  fetchDevices: () => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  isLoading: false,
  fetchDevices: async () => {
    set({ isLoading: true });
    try {
      const devices = await api.getDevices();
      set({ devices, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
```

- [ ] **Step 6: Create PushModeSelector**

`src/components/PushModeSelector.tsx`:

```tsx
import { usePushStore } from "../stores/pushStore";
import { useDeviceStore } from "../stores/deviceStore";
import { DURATION_LABELS } from "../types";
import type { Duration } from "../types";

const DURATIONS: Duration[] = ["10m", "1h", "3h", "12h", "1d", "3d", "1w"];

export default function PushModeSelector() {
  const pushMode = usePushStore((s) => s.pushMode);
  const setPushMode = usePushStore((s) => s.setPushMode);
  const selectedDeviceId = usePushStore((s) => s.selectedDeviceId);
  const setSelectedDeviceId = usePushStore((s) => s.setSelectedDeviceId);
  const selectedDuration = usePushStore((s) => s.selectedDuration);
  const setSelectedDuration = usePushStore((s) => s.setSelectedDuration);
  const devices = useDeviceStore((s) => s.devices);

  return (
    <div className="flex flex-col gap-2 text-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPushMode("auto")}
          className={`px-3 py-1 rounded-md ${pushMode === "auto" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Auto</button>
        <button
          onClick={() => setPushMode("manual")}
          className={`px-3 py-1 rounded-md ${pushMode === "manual" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Manual</button>
      </div>
      {pushMode === "manual" && (
        <div className="flex flex-col gap-2">
          <select
            value={selectedDeviceId ?? ""}
            onChange={(e) => setSelectedDeviceId(e.target.value || null)}
            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-gray-700 outline-none"
          >
            <option value="">Select device...</option>
            {devices.filter((d) => d.status === "online").map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1">
            {DURATIONS.map((d) => (
              <button key={d} onClick={() => setSelectedDuration(d)}
                className={`px-2 py-0.5 rounded ${selectedDuration === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
              >{DURATION_LABELS[d]}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create StatusIndicator**

`src/components/StatusIndicator.tsx`:

```tsx
import { useEffect } from "react";
import { usePushStore } from "../stores/pushStore";

export default function StatusIndicator() {
  const lastResult = usePushStore((s) => s.lastResult);
  const clearResult = usePushStore((s) => s.clearResult);

  useEffect(() => {
    if (lastResult) {
      const t = setTimeout(clearResult, 3000);
      return () => clearTimeout(t);
    }
  }, [lastResult, clearResult]);

  if (!lastResult) return null;

  return (
    <div className="mx-4 mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
      Pushed: {lastResult.content.slice(0, 50)}{lastResult.content.length > 50 ? "..." : ""}
      {lastResult.pushMode === "manual" && lastResult.deviceName && (
        <span className="text-green-500"> → {lastResult.deviceName}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Update App.tsx to use real components**

Replace `src/App.tsx`:

```tsx
import { useAppStore } from "./stores/appStore";
import { useTauriWindow } from "./hooks/useTauriWindow";
import InputBar from "./components/InputBar";
import PushModeSelector from "./components/PushModeSelector";
import StatusIndicator from "./components/StatusIndicator";
import BottomNav from "./components/BottomNav";

function ViewContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <p className="text-sm text-gray-400">{activeTab} view</p>
    </div>
  );
}

export default function App() {
  const mode = useAppStore((s) => s.mode);
  useTauriWindow();

  return (
    <div
      className={`flex flex-col bg-white transition-all duration-200 ease-out ${
        mode === "mini" ? "rounded-xl shadow-lg" : "rounded-2xl shadow-xl"
      }`}
      style={{ height: "100vh" }}
    >
      {mode === "expanded" && (
        <div className="text-center pt-5 pb-2">
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">inklet</h1>
          <p className="text-[11px] text-gray-400">Portal</p>
        </div>
      )}

      <div className="px-4 py-2">
        <InputBar />
      </div>

      {mode === "expanded" && (
        <div className="px-4 pb-2">
          <PushModeSelector />
        </div>
      )}

      <StatusIndicator />

      {mode === "expanded" && (
        <>
          <ViewContent />
          <BottomNav />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/ tests/
git commit -m "feat: add push store, input bar, mode selector, and status indicator"
```

---

### Task 8: Device Store (test) & Home View

**Files:** Test: `tests/stores/deviceStore.test.ts`. Create `src/views/HomeView.tsx`.

Note: `src/stores/deviceStore.ts` was already created in Task 7 Step 5a. This task adds its test and the HomeView.

- [ ] **Step 1: Write deviceStore tests**

`tests/stores/deviceStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDeviceStore } from "../src/stores/deviceStore";

vi.mock("../src/api/client", () => ({
  api: {
    getDevices: vi.fn(() => Promise.resolve([
      { id: "d1", name: "Study", status: "online", currentContent: "Notes", manualUntil: null },
    ])),
  },
}));

describe("deviceStore", () => {
  beforeEach(() => {
    useDeviceStore.setState({ devices: [], isLoading: false });
  });

  it("fetches devices", async () => {
    await useDeviceStore.getState().fetchDevices();
    expect(useDeviceStore.getState().devices).toHaveLength(1);
    expect(useDeviceStore.getState().devices[0].name).toBe("Study");
  });
});
```

- [ ] **Step 2: Run test — expect PASS**

Run: `pnpm test -- tests/stores/deviceStore.test.ts`
Expected: PASS (deviceStore was created in Task 7)

- [ ] **Step 3: Create HomeView**

`src/views/HomeView.tsx`:

```tsx
import { useEffect } from "react";
import { usePushStore } from "../stores/pushStore";
import { api } from "../api/client";
import { useState } from "react";
import type { PushRecord } from "../types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function remainingTime(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export default function HomeView() {
  const [records, setRecords] = useState<PushRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const lastResult = usePushStore((s) => s.lastResult);

  useEffect(() => {
    api.getHistory().then(({ records }) => {
      setRecords(records);
      setLoading(false);
    });
  }, [lastResult]);

  if (loading) {
    return <p className="text-xs text-gray-400 text-center py-4">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400 font-medium">Recent pushes</p>
      {records.map((r) => (
        <div key={r.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 shrink-0">
            {r.contentType === "url" ? "🔗" : r.contentType === "image" ? "🖼" : "📝"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 truncate">{r.content}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {timeAgo(r.createdAt)}
              {r.pushMode === "manual" && r.deviceName && ` → ${r.deviceName}`}
              {r.pushMode === "manual" && r.expiresAt && (
                <span className="text-amber-500 ml-1">{remainingTime(r.expiresAt)}</span>
              )}
            </p>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            r.status === "distributed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          }`}>
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Wire HomeView into App.tsx**

In `src/App.tsx`, replace the `ViewContent` function:

```tsx
import HomeView from "./views/HomeView";

function ViewContent() {
  const activeTab = useAppStore((s) => s.activeTab);

  switch (activeTab) {
    case "home": return <HomeView />;
    default: return <p className="text-sm text-gray-400">{activeTab} view</p>;
  }
}
```

Add the import at the top of the file.

- [ ] **Step 7: Commit**

```bash
git add src/ tests/
git commit -m "feat: add device store and home view with recent pushes"
```

---

### Task 9: History View & Store

**Files:** Create `src/stores/historyStore.ts`, `src/views/HistoryView.tsx`. Test: `tests/stores/historyStore.test.ts`

- [ ] **Step 1: Write historyStore tests**

`tests/stores/historyStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useHistoryStore } from "../src/stores/historyStore";

vi.mock("../src/api/client", () => ({
  api: {
    getHistory: vi.fn(() => Promise.resolve({
      records: [{ id: "p1", content: "test", contentType: "text", pushMode: "auto", status: "queued", createdAt: new Date().toISOString(), deviceId: null, deviceName: null, duration: null, expiresAt: null }],
      total: 1,
    })),
  },
}));

describe("historyStore", () => {
  beforeEach(() => {
    useHistoryStore.setState({ records: [], total: 0, isLoading: false, searchQuery: "", filterMode: null });
  });

  it("fetches history", async () => {
    await useHistoryStore.getState().fetchHistory();
    expect(useHistoryStore.getState().records).toHaveLength(1);
    expect(useHistoryStore.getState().total).toBe(1);
  });

  it("filters by search query", () => {
    useHistoryStore.getState().setSearchQuery("hello");
    expect(useHistoryStore.getState().searchQuery).toBe("hello");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test -- tests/stores/historyStore.test.ts`

- [ ] **Step 3: Create historyStore**

`src/stores/historyStore.ts`:

```ts
import { create } from "zustand";
import { api } from "../api/client";
import type { PushRecord, PushMode } from "../types";

interface HistoryState {
  records: PushRecord[];
  total: number;
  isLoading: boolean;
  searchQuery: string;
  filterMode: PushMode | null;
  fetchHistory: (page?: number) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setFilterMode: (mode: PushMode | null) => void;
  filteredRecords: () => PushRecord[];
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  records: [],
  total: 0,
  isLoading: false,
  searchQuery: "",
  filterMode: null,

  fetchHistory: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { records, total } = await api.getHistory(page);
      set({ records, total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterMode: (filterMode) => set({ filterMode }),

  filteredRecords: () => {
    const { records, searchQuery, filterMode } = get();
    return records.filter((r) => {
      if (filterMode && r.pushMode !== filterMode) return false;
      if (searchQuery && !r.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  },
}));
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test -- tests/stores/historyStore.test.ts`

- [ ] **Step 5: Create HistoryView**

`src/views/HistoryView.tsx`:

```tsx
import { useEffect } from "react";
import { useHistoryStore } from "../stores/historyStore";

export default function HistoryView() {
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);
  const filteredRecords = useHistoryStore((s) => s.filteredRecords);
  const searchQuery = useHistoryStore((s) => s.searchQuery);
  const setSearchQuery = useHistoryStore((s) => s.setSearchQuery);
  const filterMode = useHistoryStore((s) => s.filterMode);
  const setFilterMode = useHistoryStore((s) => s.setFilterMode);
  const isLoading = useHistoryStore((s) => s.isLoading);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const records = filteredRecords();

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none"
      />

      <div className="flex gap-1 text-xs">
        {([null, "auto", "manual"] as const).map((m) => (
          <button key={String(m)} onClick={() => setFilterMode(m)}
            className={`px-2 py-0.5 rounded ${filterMode === m ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
          >{m ?? "All"}</button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-xs text-gray-400 text-center">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-xs text-gray-400 text-center">No results</p>
      ) : (
        records.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{r.content}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
                {r.deviceName && ` → ${r.deviceName}`}
                <span className="ml-1 text-gray-300">({r.pushMode})</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 6: Wire into App.tsx**

Add import and case in `ViewContent`:

```tsx
import HistoryView from "./views/HistoryView";

// In switch:
case "history": return <HistoryView />;
```

- [ ] **Step 7: Commit**

```bash
git add src/ tests/
git commit -m "feat: add history view with search and filters"
```

---

### Task 10: Devices View

**Files:** Create `src/views/DevicesView.tsx`. Wire into App.tsx.

- [ ] **Step 1: Create DevicesView**

`src/views/DevicesView.tsx`:

```tsx
import { useEffect } from "react";
import { useDeviceStore } from "../stores/deviceStore";

function remainingTime(manualUntil: string | null): string | null {
  if (!manualUntil) return null;
  const diff = new Date(manualUntil).getTime() - Date.now();
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function DevicesView() {
  const devices = useDeviceStore((s) => s.devices);
  const isLoading = useDeviceStore((s) => s.isLoading);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  if (isLoading) return <p className="text-xs text-gray-400 text-center py-4">Loading...</p>;

  return (
    <div className="flex flex-col gap-2">
      {devices.map((d) => {
        const remaining = remainingTime(d.manualUntil);
        return (
          <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.status === "online" ? "bg-green-400" : "bg-gray-300"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{d.name}</p>
              <p className="text-[11px] text-gray-400 truncate">
                {d.currentContent ?? "No content"}
                {remaining && <span className="text-amber-500 ml-1">(manual: {remaining})</span>}
              </p>
            </div>
            <span className="text-[10px] text-gray-400">{d.status}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.tsx**

```tsx
import DevicesView from "./views/DevicesView";
// case "devices": return <DevicesView />;
```

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: add devices view"
```

---

### Task 11: Sources View & Store

**Files:** Create `src/stores/sourceStore.ts`, `src/views/SourcesView.tsx`. Test: `tests/stores/sourceStore.test.ts`

- [ ] **Step 1: Write sourceStore tests**

`tests/stores/sourceStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSourceStore } from "../src/stores/sourceStore";

vi.mock("../src/api/client", () => ({
  api: {
    getSources: vi.fn(() => Promise.resolve([
      { id: "s1", provider: "notion", connected: true, label: "Notion", syncItems: [{ id: "i1", name: "Notes", enabled: true }] },
    ])),
    toggleSyncItem: vi.fn(() => Promise.resolve()),
  },
}));

describe("sourceStore", () => {
  beforeEach(() => {
    useSourceStore.setState({ sources: [], isLoading: false });
  });

  it("fetches sources", async () => {
    await useSourceStore.getState().fetchSources();
    expect(useSourceStore.getState().sources).toHaveLength(1);
  });

  it("toggles sync item", async () => {
    await useSourceStore.getState().fetchSources();
    await useSourceStore.getState().toggleItem("s1", "i1", false);
    const item = useSourceStore.getState().sources[0].syncItems[0];
    expect(item.enabled).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test -- tests/stores/sourceStore.test.ts`

- [ ] **Step 3: Create sourceStore**

`src/stores/sourceStore.ts`:

```ts
import { create } from "zustand";
import { api } from "../api/client";
import type { ContentSource } from "../types";

interface SourceState {
  sources: ContentSource[];
  isLoading: boolean;
  fetchSources: () => Promise<void>;
  toggleItem: (sourceId: string, itemId: string, enabled: boolean) => Promise<void>;
  connectSource: (provider: string) => Promise<void>;
  disconnectSource: (sourceId: string) => Promise<void>;
}

export const useSourceStore = create<SourceState>((set, get) => ({
  sources: [],
  isLoading: false,

  fetchSources: async () => {
    set({ isLoading: true });
    try {
      const sources = await api.getSources();
      set({ sources, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleItem: async (sourceId, itemId, enabled) => {
    await api.toggleSyncItem(sourceId, itemId, enabled);
    set({
      sources: get().sources.map((s) =>
        s.id === sourceId
          ? { ...s, syncItems: s.syncItems.map((i) => (i.id === itemId ? { ...i, enabled } : i)) }
          : s
      ),
    });
  },

  connectSource: async (provider) => {
    const updated = await api.connectSource(provider);
    set({ sources: get().sources.map((s) => (s.provider === provider ? updated : s)) });
  },

  disconnectSource: async (sourceId) => {
    await api.disconnectSource(sourceId);
    set({ sources: get().sources.map((s) => (s.id === sourceId ? { ...s, connected: false, syncItems: [] } : s)) });
  },
}));
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test -- tests/stores/sourceStore.test.ts`

- [ ] **Step 5: Create SourcesView**

`src/views/SourcesView.tsx`:

```tsx
import { useEffect } from "react";
import { useSourceStore } from "../stores/sourceStore";

export default function SourcesView() {
  const sources = useSourceStore((s) => s.sources);
  const isLoading = useSourceStore((s) => s.isLoading);
  const fetchSources = useSourceStore((s) => s.fetchSources);
  const toggleItem = useSourceStore((s) => s.toggleItem);
  const connectSource = useSourceStore((s) => s.connectSource);
  const disconnectSource = useSourceStore((s) => s.disconnectSource);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  if (isLoading) return <p className="text-xs text-gray-400 text-center py-4">Loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      {sources.map((s) => (
        <div key={s.id} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">{s.label}</span>
            {s.connected ? (
              <button onClick={() => disconnectSource(s.id)}
                className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-500">Disconnect</button>
            ) : (
              <button onClick={() => connectSource(s.provider)}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-900 text-white">Connect</button>
            )}
          </div>
          {s.connected && s.syncItems.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {s.syncItems.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={item.enabled}
                    onChange={(e) => toggleItem(s.id, item.id, e.target.checked)}
                    className="rounded" />
                  {item.name}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Wire into App.tsx**

```tsx
import SourcesView from "./views/SourcesView";
// case "sources": return <SourcesView />;
```

- [ ] **Step 7: Commit**

```bash
git add src/ tests/
git commit -m "feat: add sources view with sync item toggling"
```

---

### Task 12: Settings & Account View

**Files:** Create `src/views/SettingsView.tsx`. Wire into App.tsx.

- [ ] **Step 1: Create SettingsView**

`src/views/SettingsView.tsx`:

```tsx
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";

export default function SettingsView() {
  const [tab, setTab] = useState<"settings" | "account">("settings");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 text-xs">
        <button onClick={() => setTab("settings")}
          className={`px-3 py-1 rounded-md ${tab === "settings" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Settings</button>
        <button onClick={() => setTab("account")}
          className={`px-3 py-1 rounded-md ${tab === "account" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Account</button>
      </div>

      {tab === "settings" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-800">Hotkey</p>
              <p className="text-[11px] text-gray-400">Activate Inklet Portal</p>
            </div>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">⌘L</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-800">Launch on startup</p>
              <p className="text-[11px] text-gray-400">Start when you log in</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-800">Theme</p>
              <p className="text-[11px] text-gray-400">Appearance preference</p>
            </div>
            <span className="text-xs text-gray-500">System</span>
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-[11px] text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">Plan</p>
                <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">{user.plan}</span>
              </div>
              <button onClick={logout}
                className="text-sm text-red-500 text-center py-2 hover:text-red-600">Sign out</button>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Not signed in</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire into App.tsx**

```tsx
import SettingsView from "./views/SettingsView";
// case "settings": return <SettingsView />;
```

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat: add settings and account view"
```

---

### Task 13: Final App.tsx Assembly & Load Device Data

**Files:** Modify `src/App.tsx`

- [ ] **Step 1: Complete App.tsx with all views and initial data loading**

Replace `src/App.tsx`:

```tsx
import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import { useTauriWindow } from "./hooks/useTauriWindow";
import { useDeviceStore } from "./stores/deviceStore";
import InputBar from "./components/InputBar";
import PushModeSelector from "./components/PushModeSelector";
import StatusIndicator from "./components/StatusIndicator";
import BottomNav from "./components/BottomNav";
import HomeView from "./views/HomeView";
import HistoryView from "./views/HistoryView";
import DevicesView from "./views/DevicesView";
import SourcesView from "./views/SourcesView";
import SettingsView from "./views/SettingsView";

function ViewContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  switch (activeTab) {
    case "home": return <HomeView />;
    case "history": return <HistoryView />;
    case "devices": return <DevicesView />;
    case "sources": return <SourcesView />;
    case "settings": return <SettingsView />;
  }
}

export default function App() {
  const mode = useAppStore((s) => s.mode);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);

  useTauriWindow();

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  return (
    <div
      className={`flex flex-col bg-white transition-all duration-200 ease-out ${
        mode === "mini" ? "rounded-xl shadow-lg" : "rounded-2xl shadow-xl"
      }`}
      style={{ height: "100vh" }}
    >
      {mode === "expanded" && (
        <div className="text-center pt-5 pb-2">
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">inklet</h1>
          <p className="text-[11px] text-gray-400">Portal</p>
        </div>
      )}

      <div className="px-4 py-2">
        <InputBar />
      </div>

      {mode === "expanded" && (
        <div className="px-4 pb-2">
          <PushModeSelector />
        </div>
      )}

      <StatusIndicator />

      {mode === "expanded" && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <ViewContent />
          </div>
          <BottomNav />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 3: Verify in browser**

Run: `pnpm dev`
Open http://localhost:1420. Verify: input bar renders, clicking expands, bottom nav switches views, mock data appears.

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: assemble all views and load initial device data"
```

---

### Task 14: Run Full App in Tauri

**Files:** No new files — verification only

- [ ] **Step 1: Verify Rust compiles**

Run: `cd src-tauri && cargo check`
Expected: No errors

- [ ] **Step 2: Run full Tauri dev mode**

Run: `pnpm tauri dev`
Expected: App window appears. Press ⌘L — window shows/hides. Click input bar — window expands. ESC — hides. Tray icon visible.

- [ ] **Step 3: Run all tests one final time**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Inklet Portal v0.1 — all features functional"
```
