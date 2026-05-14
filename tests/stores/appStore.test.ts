import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../src/stores/appStore";

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState({ mode: "mini", activeTab: "home" });
  });

  it("starts in mini mode with home tab", () => {
    const s = useAppStore.getState();
    expect(s.mode).toBe("mini");
    expect(s.activeTab).toBe("home");
  });

  it("toggles mode", () => {
    useAppStore.getState().toggleMode();
    expect(useAppStore.getState().mode).toBe("expanded");
    useAppStore.getState().toggleMode();
    expect(useAppStore.getState().mode).toBe("mini");
  });

  it("setActiveTab switches to expanded", () => {
    useAppStore.getState().setActiveTab("devices");
    const s = useAppStore.getState();
    expect(s.activeTab).toBe("devices");
    expect(s.mode).toBe("expanded");
  });
});
