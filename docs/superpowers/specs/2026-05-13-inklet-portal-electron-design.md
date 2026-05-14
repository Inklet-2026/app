# Inklet Portal (Electron) — Design Spec

## Overview

A single-panel desktop app for pushing content to Inklet e-ink devices. Fixed-size window with native macOS controls, input box with attachment tools, and auto/manual push mode.

**Platforms:** macOS + Windows (macOS first)
**Tech stack:** Electron + React 18 + TypeScript + Vite + Tailwind CSS + pnpm

## Window

- Fixed size: ~500x240
- `titleBarStyle: 'hiddenInset'` — native traffic lights, no title text, content extends into title bar area
- Always on top
- Single window, no expand/collapse modes

## Layout

```
┌─────────────────────────────────────────────────┐
│ ● ● ●                                          │  system traffic lights
│                                                 │
│  inklet PORTAL              [Login]  [⚙]       │  header row
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ Push content to device...                 │  │  input textarea
│  │                                           │  │
│  │                                           │  │
│  │ [attached items if any]                   │  │
│  │                                           │  │
│  │ [⬆] [📋] [🔗]        [Auto⇄Manual▾] [↑] │  │  toolbar
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Header Row

- Left: "inklet" (Newsreader serif, weight 300, 17px) + "PORTAL" (Inter, uppercase, letter-spaced, 9px, weight 500, muted color)
- Right: Login text or username (clickable) + settings gear icon (⚙)
- Entire header is draggable (`-webkit-app-region: drag`), buttons are `no-drag`
- Top padding ~28px to clear traffic lights

## Input Box

- Background: `#ECEAE4`, border: `1px solid #E0DDD6`, border-radius: 12px
- Textarea: top of box, placeholder "Push content to device...", min-height ~60px
- Attachment area: horizontal list of small pills (image/link/clipboard), each with × to remove
- Toolbar at bottom of input box

## Toolbar

Left side:
- **Upload [⬆]**: Opens file picker for images
- **Clipboard [📋]**: Reads clipboard (text → textarea, image → attachment)
- **Link [🔗]**: Opens inline modal to enter URL, creates link card attachment

Right side:
- **Mode switch**: Toggle between "Auto" and "Manual"
  - Auto (default): Just a label, content is routed by AI
  - Manual: Label becomes dropdown, shows device list to pick target device
- **Submit [↑]**: Push content + attachments

All tool buttons: 28x28, border-radius 7px, bg `#EFEDE7`, border `1px solid #E0DDD6`

## Push Modes

- **Auto**: Content submitted → API → AI routes to device(s). No device selection needed.
- **Manual**: User selects target device from dropdown. Content goes to that device.

## Visual Design

- Window background: `#F5F3ED`
- Input box background: `#ECEAE4`
- Card/button background: `#EFEDE7`
- Border color: `#E0DDD6`
- Text: `#1A1A1A`
- Secondary text: `#666666`
- Muted text: `#999999`
- Fonts: Newsreader (serif, headings/logo), Inter (sans, body)

## Project Structure

```
inklet-app/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # Preload script (IPC bridge)
├── src/
│   ├── main.tsx         # React entry
│   ├── App.tsx          # Root component
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── InputBox.tsx
│   │   ├── Toolbar.tsx
│   │   ├── AttachmentList.tsx
│   │   ├── LinkModal.tsx
│   │   └── ModeSwitch.tsx
│   ├── types/index.ts
│   ├── api/
│   │   ├── client.ts
│   │   └── mock.ts
│   └── styles/globals.css
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── electron-builder.json5
```

## Backend / API

Same mock API layer as before. `USE_MOCK = true` flag, swap to real REST API later.

## What Is NOT In Scope

- Expand/collapse window modes
- Bottom navigation / tab views (history, devices, sources, settings)
- System tray
- Global hotkeys
- Window position animation
