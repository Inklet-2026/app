import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDeviceStore } from "../src/stores/deviceStore";

vi.mock("../src/api/client", () => ({
  api: {
    getDevices: vi.fn(() => Promise.resolve([
      { id: "d1", name: "Study", status: "online", currentContent: "Notes", manualUntil: null },
    ])),
  },
}));

describe("deviceStore", () => {
  beforeEach(() => {
    useDeviceStore.setState({ devices: [], isLoading: false });
  });

  it("fetches devices", async () => {
    await useDeviceStore.getState().fetchDevices();
    expect(useDeviceStore.getState().devices).toHaveLength(1);
    expect(useDeviceStore.getState().devices[0].name).toBe("Study");
  });
});
