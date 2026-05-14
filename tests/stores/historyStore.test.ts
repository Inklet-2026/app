import { describe, it, expect, beforeEach, vi } from "vitest";
import { useHistoryStore } from "../src/stores/historyStore";

vi.mock("../src/api/client", () => ({
  api: {
    getHistory: vi.fn(() => Promise.resolve({
      records: [{ id: "p1", content: "test", contentType: "text", pushMode: "auto", status: "queued", createdAt: new Date().toISOString(), deviceId: null, deviceName: null, duration: null, expiresAt: null }],
      total: 1,
    })),
  },
}));

describe("historyStore", () => {
  beforeEach(() => {
    useHistoryStore.setState({ records: [], total: 0, isLoading: false, searchQuery: "", filterMode: null });
  });

  it("fetches history", async () => {
    await useHistoryStore.getState().fetchHistory();
    expect(useHistoryStore.getState().records).toHaveLength(1);
    expect(useHistoryStore.getState().total).toBe(1);
  });

  it("filters by search query", () => {
    useHistoryStore.getState().setSearchQuery("hello");
    expect(useHistoryStore.getState().searchQuery).toBe("hello");
  });
});
