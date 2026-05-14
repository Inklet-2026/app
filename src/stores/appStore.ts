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
