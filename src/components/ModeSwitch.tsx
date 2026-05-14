import { useState } from "react";

const MOCK_DEVICES = [
  { id: "d1", name: "Study" },
  { id: "d2", name: "Living Room" },
  { id: "d3", name: "Desk" },
];

interface Props {
  mode: "auto" | "manual";
  deviceId: string | null;
  onModeChange: (mode: "auto" | "manual") => void;
  onDeviceChange: (id: string | null) => void;
}

export default function ModeSwitch({ mode, deviceId, onModeChange, onDeviceChange }: Props) {
  const [open, setOpen] = useState(false);

  if (mode === "auto") {
    return (
      <button
        onClick={() => onModeChange("manual")}
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 7, padding: "4px 10px",
          fontSize: 11, color: "var(--text-secondary)",
          cursor: "pointer", fontFamily: "var(--font-sans)",
          whiteSpace: "nowrap" as const,
        }}
      >
        Auto
      </button>
    );
  }

  const selected = MOCK_DEVICES.find((d) => d.id === deviceId);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "var(--accent)", border: "none",
          borderRadius: 7, padding: "4px 10px",
          fontSize: 11, color: "var(--bg)",
          cursor: "pointer", fontFamily: "var(--font-sans)",
          fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
          whiteSpace: "nowrap" as const,
        }}
      >
        {selected ? selected.name : "Manual"}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 4px)", right: 0,
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 8, padding: 4, minWidth: 120,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 50,
        }}>
          <button
            onClick={() => { onModeChange("auto"); setOpen(false); }}
            style={{
              display: "block", width: "100%", textAlign: "left",
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 10px", fontSize: 12, borderRadius: 5,
              color: "var(--text-secondary)", fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            ← Auto mode
          </button>
          <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />
          {MOCK_DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => { onDeviceChange(d.id); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: deviceId === d.id ? "var(--bg-card)" : "none",
                border: "none", cursor: "pointer",
                padding: "6px 10px", fontSize: 12, borderRadius: 5,
                color: "var(--text)", fontFamily: "var(--font-sans)",
                fontWeight: deviceId === d.id ? 500 : 400,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
              onMouseLeave={(e) => { if (deviceId !== d.id) e.currentTarget.style.background = "none"; }}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
