import { useState, useRef, useEffect, useCallback } from "react";

const MOCK_DEVICES = [
  { id: "d1", name: "Study" },
  { id: "d2", name: "Living Room" },
  { id: "d3", name: "Desk" },
];

const DURATIONS = [
  { value: "10m", label: "10 min" },
  { value: "1h", label: "1 hour" },
  { value: "3h", label: "3 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "1w", label: "1 week" },
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
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ x: r.right, y: r.top });
    }
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      (window as any).electronAPI?.resizeWindow(500, 480);
    } else {
      (window as any).electronAPI?.resizeWindow(500, 240);
    }
  }, [open, updatePos]);

  const pill: React.CSSProperties = {
    fontSize: 11, padding: "4px 10px", cursor: "pointer",
    border: "none", fontFamily: "var(--font-sans)", fontWeight: 500,
    transition: "all 120ms",
  };

  return (
    <>
      <div ref={btnRef} style={{ position: "relative" }}>
        <div style={{
          display: "flex", borderRadius: 7, overflow: "hidden",
          border: "1px solid var(--border)",
        }}>
          <button
            onClick={() => { onModeChange("auto"); setOpen(false); }}
            style={{
              ...pill,
              background: mode === "auto" ? "var(--accent)" : "var(--bg-card)",
              color: mode === "auto" ? "var(--bg)" : "var(--text-muted)",
              borderRadius: 0,
            }}
          >Auto</button>
          <button
            onClick={() => {
              onModeChange("manual");
              setOpen(!open);
            }}
            style={{
              ...pill,
              background: mode === "manual" ? "var(--accent)" : "var(--bg-card)",
              color: mode === "manual" ? "var(--bg)" : "var(--text-muted)",
              borderRadius: 0, borderLeft: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 3,
            }}
          >
            {mode === "manual" && deviceId
              ? MOCK_DEVICES.find((d) => d.id === deviceId)?.name ?? "Manual"
              : "Manual"}
            {mode === "manual" && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown — position: fixed so it's not clipped by any overflow */}
      {open && mode === "manual" && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: Math.max(8, pos.y - 220),
            left: pos.x - 190,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 10, padding: 6, width: 186,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            zIndex: 9999,
          }}
        >
          <p style={{ fontSize: 10, color: "var(--text-muted)", padding: "4px 8px 2px", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
            Device
          </p>
          {MOCK_DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => onDeviceChange(d.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: deviceId === d.id ? "var(--bg-card)" : "none",
                border: "none", cursor: "pointer",
                padding: "6px 8px", fontSize: 12, borderRadius: 6,
                color: "var(--text)", fontFamily: "var(--font-sans)",
                fontWeight: deviceId === d.id ? 500 : 400,
              }}
              onMouseEnter={(e) => { if (deviceId !== d.id) e.currentTarget.style.background = "var(--bg-card)"; }}
              onMouseLeave={(e) => { if (deviceId !== d.id) e.currentTarget.style.background = "none"; }}
            >
              {d.name}
            </button>
          ))}

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          <p style={{ fontSize: 10, color: "var(--text-muted)", padding: "4px 8px 2px", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
            Duration
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "2px 4px 4px" }}>
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => { onDurationChange(d.value); setOpen(false); }}
                style={{
                  fontSize: 11, padding: "3px 8px", borderRadius: 5,
                  border: "none", cursor: "pointer",
                  background: duration === d.value ? "var(--accent)" : "var(--bg-input)",
                  color: duration === d.value ? "var(--bg)" : "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
