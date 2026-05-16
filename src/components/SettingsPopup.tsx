import { useState, useEffect } from "react";

function formatAccelerator(a: string): string {
  return a.replace("CommandOrControl", "⌘").replace("Control", "Ctrl").replace("Shift", "⇧").replace("Alt", "⌥").replace(/\+/g, " ");
}

export default function SettingsPopup() {
  const params = new URLSearchParams(window.location.search);
  const [hotkey, setHotkey] = useState(params.get("hotkey") || "CommandOrControl+L");
  const [closeToTray, setCloseToTray] = useState(params.get("closeToTray") === "true");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!recording) return;
    function onKey(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;

      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push("CommandOrControl");
      if (e.shiftKey) parts.push("Shift");
      if (e.altKey) parts.push("Alt");
      parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);

      const accelerator = parts.join("+");
      setHotkey(accelerator);
      setRecording(false);
      (window as any).electronAPI?.updateHotkey(accelerator);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recording]);

  function handleCloseToTray(val: boolean) {
    setCloseToTray(val);
    (window as any).electronAPI?.updateCloseToTray(val);
  }

  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "7px 8px", borderRadius: 6,
  };

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12, padding: 10,
      height: "100vh", display: "flex", flexDirection: "column",
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontSize: 10, color: "var(--text-muted)", padding: "2px 6px 4px", margin: 0,
        textTransform: "uppercase" as const, letterSpacing: "0.06em",
      }}>
        Settings
      </p>

      {/* Hotkey */}
      <div style={row}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>Hotkey</span>
        <button
          onClick={() => setRecording(true)}
          style={{
            fontSize: 11, color: recording ? "var(--accent)" : "var(--text-muted)",
            background: "var(--bg-input)", border: "1px solid var(--border)",
            padding: "2px 8px", borderRadius: 4, fontFamily: "monospace",
            cursor: "pointer", minWidth: 50, textAlign: "center",
          }}
        >
          {recording ? "Press keys..." : formatAccelerator(hotkey)}
        </button>
      </div>

      {/* Close behavior */}
      <div style={row}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>Close to tray</span>
        <div style={{
          width: 36, height: 20, borderRadius: 10, cursor: "pointer",
          background: closeToTray ? "var(--accent)" : "var(--border)",
          transition: "background 150ms", position: "relative",
          flexShrink: 0,
        }} onClick={() => handleCloseToTray(!closeToTray)}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            background: "white", position: "absolute", top: 2,
            left: closeToTray ? 18 : 2,
            transition: "left 150ms",
          }} />
        </div>
      </div>

      {/* Account */}
      <button
        onClick={() => (window as any).electronAPI?.openExternal("https://www.iminklet.com")}
        style={{
          ...row, width: "100%", background: "none", border: "none",
          cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
          transition: "background 80ms",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
      >
        <span style={{ fontSize: 12, color: "var(--text)" }}>Manage account</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--text-muted)" }}>
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div style={{ flex: 1 }} />

      <p style={{
        fontSize: 10, color: "var(--text-muted)", textAlign: "center",
        margin: 0, padding: "2px 0", opacity: 0.5,
      }}>
        inklet Portal v0.1.0
      </p>
    </div>
  );
}
