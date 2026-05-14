import { useState } from "react";

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

export default function ManualPopup() {
  const params = new URLSearchParams(window.location.search);
  const [deviceId, setDeviceId] = useState(params.get("deviceId") || "");
  const [duration, setDuration] = useState(params.get("duration") || "1h");

  function handleSelect(did: string) {
    setDeviceId(did);
  }

  function trySend(did: string, dur: string) {
    if (did && dur) {
      (window as any).electronAPI?.sendManualSelection(did, dur);
    }
  }

  function handleDeviceClick(did: string) {
    setDeviceId(did);
    trySend(did, duration);
  }

  function handleDuration(d: string) {
    setDuration(d);
    trySend(deviceId, d);
  }

  return (
    <div style={{
      background: "var(--bg)",
      borderRadius: 10,
      padding: 6,
      height: "100vh",
      overflow: "hidden",
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontSize: 10, color: "var(--text-muted)",
        padding: "4px 8px 2px", margin: 0,
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
      }}>
        Device
      </p>
      {MOCK_DEVICES.map((d) => (
        <button
          key={d.id}
          onClick={() => handleDeviceClick(d.id)}
          style={{
            display: "block", width: "100%", textAlign: "left",
            background: deviceId === d.id ? "var(--bg-card)" : "none",
            border: "none", cursor: "pointer",
            padding: "6px 8px", fontSize: 12, borderRadius: 6,
            color: "var(--text)", fontFamily: "var(--font-sans)",
            fontWeight: deviceId === d.id ? 500 : 400,
            transition: "background 80ms",
          }}
          onMouseEnter={(e) => { if (deviceId !== d.id) e.currentTarget.style.background = "var(--bg-card)"; }}
          onMouseLeave={(e) => { if (deviceId !== d.id) e.currentTarget.style.background = "none"; }}
        >
          {d.name}
        </button>
      ))}

      <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

      <p style={{
        fontSize: 10, color: "var(--text-muted)",
        padding: "4px 8px 2px", margin: 0,
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
      }}>
        Duration
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "2px 4px 4px" }}>
        {DURATIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => handleDuration(d.value)}
            style={{
              fontSize: 11, padding: "3px 8px", borderRadius: 5,
              border: "none", cursor: "pointer",
              background: duration === d.value ? "var(--accent)" : "var(--bg-input)",
              color: duration === d.value ? "var(--bg)" : "var(--text-secondary)",
              fontFamily: "var(--font-sans)",
              transition: "background 80ms",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
