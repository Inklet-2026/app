import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePushStore } from "../src/stores/pushStore";

vi.mock("../src/api/client", () => ({
  api: {
    pushContent: vi.fn(() =>
      Promise.resolve({
        id: "p1", content: "test", contentType: "text", pushMode: "auto",
        status: "queued", createdAt: new Date().toISOString(),
        deviceId: null, deviceName: null, duration: null, expiresAt: null,
      })
    ),
  },
}));

describe("pushStore", () => {
  beforeEach(() => {
    usePushStore.setState({
      content: "", pushMode: "auto", selectedDeviceId: null,
      selectedDuration: "1h", isSubmitting: false, lastResult: null,
    });
  });

  it("starts with empty content in auto mode", () => {
    const s = usePushStore.getState();
    expect(s.content).toBe("");
    expect(s.pushMode).toBe("auto");
  });

  it("does not submit empty content", async () => {
    await usePushStore.getState().submit();
    expect(usePushStore.getState().lastResult).toBeNull();
  });

  it("submits and resets", async () => {
    usePushStore.getState().setContent("test note");
    await usePushStore.getState().submit();
    const s = usePushStore.getState();
    expect(s.content).toBe("");
    expect(s.lastResult).not.toBeNull();
  });

  it("detects URL content type", () => {
    usePushStore.getState().setContent("https://example.com");
    expect(usePushStore.getState().detectedContentType).toBe("url");
  });

  it("detects text content type", () => {
    usePushStore.getState().setContent("just notes");
    expect(usePushStore.getState().detectedContentType).toBe("text");
  });
});
