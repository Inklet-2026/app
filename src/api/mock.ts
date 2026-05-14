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
