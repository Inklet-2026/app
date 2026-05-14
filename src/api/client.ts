import type { PushRecord, PushRequest, Device, ContentSource, User } from "../types";
import { mockUser, mockDevices, mockPushHistory, mockSources } from "./mock";

const USE_MOCK = true;
const BASE_URL = "";
let authToken: string | null = null;

async function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK) { await delay(); return { token: "mock-token", user: mockUser }; }
    return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },

  async getUser(): Promise<User> {
    if (USE_MOCK) { await delay(); return mockUser; }
    return request("/user");
  },

  async pushContent(req: PushRequest): Promise<PushRecord> {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: `p${Date.now()}`, content: req.content, contentType: req.contentType,
        pushMode: req.pushMode, status: "queued", createdAt: new Date().toISOString(),
        deviceId: req.deviceId,
        deviceName: req.deviceId ? mockDevices.find((d) => d.id === req.deviceId)?.name ?? null : null,
        duration: req.duration, expiresAt: null,
      };
    }
    return request("/push", { method: "POST", body: JSON.stringify(req) });
  },

  async getHistory(page = 1): Promise<{ records: PushRecord[]; total: number }> {
    if (USE_MOCK) { await delay(); return { records: mockPushHistory, total: mockPushHistory.length }; }
    return request(`/push/history?page=${page}`);
  },

  async getDevices(): Promise<Device[]> {
    if (USE_MOCK) { await delay(); return mockDevices; }
    return request("/devices");
  },

  async getSources(): Promise<ContentSource[]> {
    if (USE_MOCK) { await delay(); return mockSources; }
    return request("/sources");
  },

  async toggleSyncItem(sourceId: string, itemId: string, enabled: boolean): Promise<void> {
    if (USE_MOCK) { await delay(); return; }
    await request(`/sources/${sourceId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ enabled }) });
  },

  async connectSource(provider: string): Promise<ContentSource> {
    if (USE_MOCK) { await delay(); return { ...mockSources.find((s) => s.provider === provider)!, connected: true }; }
    return request("/sources/connect", { method: "POST", body: JSON.stringify({ provider }) });
  },

  async disconnectSource(sourceId: string): Promise<void> {
    if (USE_MOCK) { await delay(); return; }
    await request(`/sources/${sourceId}/disconnect`, { method: "POST" });
  },
};
