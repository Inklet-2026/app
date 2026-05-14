# Inklet Portal — Design Spec

## Overview

Inklet Portal is a cross-platform desktop companion app for the Inklet e-ink display system. It provides a fast, hotkey-driven interface for pushing content to e-ink devices, with AI-powered automatic routing or manual device targeting.

**Platforms:** macOS + Windows
**Tech stack:** Tauri v2 + React 18 + TypeScript + Vite + pnpm

## Architecture

### Single Window + Mode Switching

One window that transitions between two modes:

- **Mini mode (~400×50px):** Borderless, always-on-top, centered upper screen, transparent rounded corners. Just the input bar. Triggered by global hotkey.
- **Expanded mode (~420×500px):** Expands outward from the input bar in all directions (animated transition). Shows logo above, input bar in center, content area below, function buttons at bottom.

### System Tray

- Persistent tray icon while app is running
- Right-click menu: Open / Settings / Quit
- Left-click: toggle mini mode visibility

### Global Hotkey

- macOS: ⌘L
- Windows: Ctrl+L
- Toggles mini mode visibility
- ESC: collapse to mini mode and hide
- Click outside window: hide

## UI Layout

### Mini Mode

```
┌──────────────────────────────────────┐
│ [+]  输入或粘贴内容推送到设备...  [↑] │
└──────────────────────────────────────┘
```

### Expanded Mode

```
┌──────────────────────────────────────┐
│              inklet                   │
│              Portal                  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [+]  输入内容推送到设备...  [↑] │  │
│  └────────────────────────────────┘  │
│                                      │
│  最近推送                            │
│  ┌────────────────────────────────┐  │
│  │ 📝 Meeting notes    3min → 书房 │  │
│  │ 🖼 Figma截图      1hr → 工作台  │  │
│  │ 🔗 阅读清单        昨天         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐     │
│  │📋│  │📱│  │🔌│  │⚙️│  │👤│     │
│  │历史│ │设备│ │内容│ │设置│ │账号│  │
│  └──┘  └──┘  └──┘  └──┘  └──┘     │
└──────────────────────────────────────┘
```

Clicking a bottom button switches the content area to that view. The input bar remains always visible at the top.

## Push Flow

Two modes of pushing content:

### Auto Mode (Default)

User submits content → API receives → AI classifies and routes to appropriate device(s) in the background. Not instant. User doesn't know or control which device receives it.

### Manual Mode

User submits content → selects target device → selects duration (10 min / 1 hour / 3 hours / 12 hours / 1 day / 3 days / 1 week) → API pushes to specified device. After the duration expires, the device returns to auto mode.

### Content Types

Supports multimedia: text, URLs, images, files, web clippings, calendar events.

## Feature Modules

### 1. Home (Default View)

- Recent push list below input bar
- Each record: content thumbnail, timestamp, push status (queued / distributed)
- Manual pushes additionally show: target device, remaining time

### 2. History

- Full push history with filters (time / content type / push mode)
- Search support
- View push details

### 3. Devices

- Bound e-ink device list
- Device name, online/offline status, current display content
- Devices in manual mode show remaining time

### 4. Content Sources

- Connected third-party integrations (Notion, Craft, Obsidian)
- Connect/disconnect management
- Select which content to sync (folder / database / notebook granularity)

### 5. Settings & Account (Single view with tab switching)

- **Settings:** Custom hotkey, launch on startup, theme (system/light), language
- **Account:** Login status, avatar, plan info, sign out

## State Management

Zustand stores:

- **appStore:** Window mode (mini/expanded), active bottom tab
- **authStore:** Login state, token, user info
- **pushStore:** Current input, push mode (auto/manual), selected device, selected duration
- **historyStore:** Push records, filters, pagination
- **deviceStore:** Device list, status, manual mode countdowns
- **sourceStore:** Connected sources, sync config per source

## Data & Storage

- **API:** All business data from RESTful API. Token-based auth.
- **Local (Tauri Store):** Preferences only — hotkey config, window position, theme, auth token.
- **Push status updates:** Polling or WebSocket (depends on backend implementation).

## Project Structure

```
inklet-app/
├── src-tauri/
│   ├── src/
│   │   └── main.rs              # Window, hotkey, tray, mode switching
│   ├── tauri.conf.json
│   └── Cargo.toml
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── InputBar.tsx
│   │   ├── PushModeSelector.tsx
│   │   └── StatusIndicator.tsx
│   ├── views/
│   │   ├── HomeView.tsx
│   │   ├── HistoryView.tsx
│   │   ├── DevicesView.tsx
│   │   ├── SourcesView.tsx
│   │   └── SettingsView.tsx
│   ├── stores/
│   │   ├── appStore.ts
│   │   ├── authStore.ts
│   │   ├── pushStore.ts
│   │   ├── historyStore.ts
│   │   ├── deviceStore.ts
│   │   └── sourceStore.ts
│   ├── api/
│   │   └── client.ts
│   ├── hooks/
│   │   └── useTauriWindow.ts
│   └── styles/
│       └── globals.css
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Key Implementation Details

- **Mode switching:** `main.rs` registers global hotkey → Tauri event notifies frontend → React switches mode → calls Tauri API to resize/reposition/redecorate window
- **Mini → Expanded animation:** CSS transition for content expansion, Tauri syncs window size simultaneously
- **Click-outside-to-hide:** Tauri `on_focus_changed` event listener → hide window on blur
- **Package manager:** pnpm

## Visual Style

Follow iminklet.com brand style (light theme, clean, modern).
