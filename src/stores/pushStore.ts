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
