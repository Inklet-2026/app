import { create } from "zustand";
import { api } from "../api/client";
import type { PushMode, Duration, ContentType, PushRecord, Attachment } from "../types";

function detectContentType(content: string, attachments: Attachment[]): ContentType {
  if (attachments.some((a) => a.type === "image")) return "image";
  if (attachments.some((a) => a.type === "link")) return "url";
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
  attachments: Attachment[];
  setContent: (content: string) => void;
  setPushMode: (mode: PushMode) => void;
  setSelectedDeviceId: (id: string | null) => void;
  setSelectedDuration: (duration: Duration) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
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
  attachments: [],

  setContent: (content) =>
    set((s) => ({ content, detectedContentType: detectContentType(content, s.attachments) })),

  setPushMode: (pushMode) => set({ pushMode }),
  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),
  setSelectedDuration: (selectedDuration) => set({ selectedDuration }),

  addAttachment: (attachment) =>
    set((s) => {
      const attachments = [...s.attachments, attachment];
      return { attachments, detectedContentType: detectContentType(s.content, attachments) };
    }),

  removeAttachment: (id) =>
    set((s) => {
      const attachments = s.attachments.filter((a) => a.id !== id);
      return { attachments, detectedContentType: detectContentType(s.content, attachments) };
    }),

  submit: async () => {
    const { content, attachments, pushMode, selectedDeviceId, selectedDuration } = get();
    const hasContent = content.trim() || attachments.length > 0;
    if (!hasContent) return;
    set({ isSubmitting: true });

    const effectiveContent =
      attachments.length > 0
        ? `${content}${content.trim() ? "\n" : ""}[attachments: ${attachments.length} item${attachments.length > 1 ? "s" : ""}]`
        : content;

    try {
      const result = await api.pushContent({
        content: effectiveContent,
        contentType: detectContentType(content, attachments),
        pushMode,
        deviceId: pushMode === "manual" ? selectedDeviceId : null,
        duration: pushMode === "manual" ? selectedDuration : null,
      });
      set({
        content: "",
        attachments: [],
        pushMode: "auto",
        selectedDeviceId: null,
        selectedDuration: "1h",
        isSubmitting: false,
        lastResult: result,
        detectedContentType: "text",
      });
    } catch {
      set({ isSubmitting: false });
    }
  },

  clearResult: () => set({ lastResult: null }),
}));
