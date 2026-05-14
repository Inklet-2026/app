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
