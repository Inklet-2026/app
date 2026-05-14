import { useRef, useEffect } from "react";

const MOCK_DEVICES = [
  { id: "d1", name: "Study" },
  { id: "d2", name: "Living Room" },
  { id: "d3", name: "Desk" },
];

interface Props {
  mode: "auto" | "manual";
  deviceId: string | null;
  duration: string;
  onModeChange: (mode: "auto" | "manual") => void;
  onDeviceChange: (id: string) => void;
  onDurationChange: (d: string) => void;
}

export default function ModeSwitch({ mode, deviceId, duration, onModeChange, onDeviceChange, onDurationChange }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api) return;
    api.onManualSelection?.((data: { deviceId: string; duration: string }) => {
      onModeChange("manual");
      onDeviceChange(data.deviceId);
      onDurationChange(data.duration);
    });
    api.onManualPopupClosed?.(() => {});
  }, [onModeChange, onDeviceChange, onDurationChange]);

  function handleManualClick() {
    if (mode === "manual" && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const sx = window.screenX || 0;
      const sy = window.screenY || 0;
      (window as any).electronAPI?.showManualPopup(
        sx + r.right, sy + r.bottom,
        deviceId, duration
      );
    } else {
      onModeChange("manual");
      setTimeout(() => {
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect();
          const sx = window.screenX || 0;
          const sy = window.screenY || 0;
          (window as any).electronAPI?.showManualPopup(
            sx + r.right, sy + r.bottom,
            deviceId, duration
          );
        }
      }, 0);
    }
  }

  const pill: React.CSSProperties = {
    fontSize: 11, padding: "0 10px", height: 30, cursor: "pointer",
    border: "none", fontFamily: "var(--font-sans)", fontWeight: 500,
    transition: "all 120ms",
  };

  return (
    <div ref={btnRef}>
      <div style={{
        display: "flex", borderRadius: 8, overflow: "hidden",
        border: "1px solid var(--border)",
      }}>
        <button
          onClick={() => { onModeChange("auto"); (window as any).electronAPI?.closeManualPopup(); }}
          style={{
            ...pill,
            background: mode === "auto" ? "var(--accent)" : "transparent",
            color: mode === "auto" ? "var(--bg)" : "var(--text-muted)",
            borderRadius: 0,
          }}
        >Auto</button>
        <button
          onClick={handleManualClick}
          style={{
            ...pill,
            background: mode === "manual" ? "var(--accent)" : "transparent",
            color: mode === "manual" ? "var(--bg)" : "var(--text-muted)",
            borderRadius: 0, borderLeft: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 3,
          }}
        >
          {mode === "manual" && deviceId ? (
            <>
              <span>{MOCK_DEVICES.find((d) => d.id === deviceId)?.name}</span>
              {duration && <span style={{ opacity: 0.5, fontWeight: 400 }}>{duration}</span>}
            </>
          ) : "Manual"}
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity: mode === "manual" ? 1 : 0.5 }}>
            <path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
