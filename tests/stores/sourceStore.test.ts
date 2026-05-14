import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSourceStore } from "../src/stores/sourceStore";

vi.mock("../src/api/client", () => ({
  api: {
    getSources: vi.fn(() => Promise.resolve([
      { id: "s1", provider: "notion", connected: true, label: "Notion", syncItems: [{ id: "i1", name: "Notes", enabled: true }] },
    ])),
    toggleSyncItem: vi.fn(() => Promise.resolve()),
  },
}));

describe("sourceStore", () => {
  beforeEach(() => {
    useSourceStore.setState({ sources: [], isLoading: false });
  });

  it("fetches sources", async () => {
    await useSourceStore.getState().fetchSources();
    expect(useSourceStore.getState().sources).toHaveLength(1);
  });

  it("toggles sync item", async () => {
    await useSourceStore.getState().fetchSources();
    await useSourceStore.getState().toggleItem("s1", "i1", false);
    const item = useSourceStore.getState().sources[0].syncItems[0];
    expect(item.enabled).toBe(false);
  });
});
