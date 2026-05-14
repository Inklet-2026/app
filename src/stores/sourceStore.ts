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
