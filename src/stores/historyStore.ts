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
