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
