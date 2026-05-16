import { useState, useEffect } from "react";

function formatAccelerator(a: string): React.ReactNode {
  const parts = a.split("+").map((p, i) => {
    const symbols: Record<string, string> = { CommandOrControl: "⌘", Shift: "⇧", Alt: "⌥", Control: "⌃" };
    if (symbols[p]) return <span key={i} style={{ fontSize: 14, lineHeight: 1 }}>{symbols[p]} </span>;
    return <span key={i} style={{ fontSize: 11, lineHeight: 1 }}>{p} </span>;
  });
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>{parts}</span>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button style={{
      width: 36, height: 20, borderRadius: 10, cursor: "pointer",
      background: value ? "var(--accent)" : "var(--border)",
      transition: "background 150ms", position: "relative",
      flexShrink: 0, border: "none", padding: 0,
    }} onClick={() => onChange(!value)}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        background: "white", position: "absolute", top: 2,
        left: value ? 18 : 2, transition: "left 150ms",
      }} />
    </button>
  );
}

export default function SettingsPopup() {
  const params = new URLSearchParams(window.location.search);
  const [hotkey, setHotkey] = useState(params.get("hotkey") || "CommandOrControl+L");
  const [closeToTray, setCloseToTray] = useState(params.get("closeToTray") === "true");
  const [openAtLogin, setOpenAtLogin] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    (window as any).electronAPI?.getOpenAtLogin?.().then((v: boolean) => setOpenAtLogin(v));
  }, []);

  useEffect(() => {
    if (!recording) return;
    (window as any).electronAPI?.updateHotkey("");
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

  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "6px 8px", borderRadius: 6,
  };

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12, padding: "8px 10px",
      height: "100vh", display: "flex", flexDirection: "column",
    }}>
      <p style={{
        fontSize: 10, color: "var(--text-muted)", padding: "2px 6px 2px", margin: 0,
        textTransform: "uppercase" as const, letterSpacing: "0.06em",
      }}>
        Settings
      </p>

      <div style={row}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>Hotkey</span>
        <button
          onClick={() => setRecording(true)}
          style={{
            fontSize: 11, color: recording ? "var(--accent)" : "var(--text-muted)",
            background: "var(--bg-input)", border: "1px solid var(--border)",
            padding: "2px 8px", borderRadius: 4, fontFamily: "monospace",
            display: "inline-flex", alignItems: "center",
            cursor: "pointer", minWidth: 50, textAlign: "center",
          }}
        >
          {recording ? "Press keys..." : formatAccelerator(hotkey)}
        </button>
      </div>

      <div style={row}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>Open at login</span>
        <Toggle value={openAtLogin} onChange={(v) => {
          setOpenAtLogin(v);
          (window as any).electronAPI?.setOpenAtLogin(v);
        }} />
      </div>

      <div style={row}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>Close to tray</span>
        <Toggle value={closeToTray} onChange={(v) => {
          setCloseToTray(v);
          (window as any).electronAPI?.updateCloseToTray(v);
        }} />
      </div>

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
          <path d="M4.5 1.5H10.5V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.5 1.5L4 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      <p style={{
        fontSize: 10, color: "var(--text-muted)", textAlign: "center",
        margin: "8px 0 0", opacity: 0.5,
      }}>
        inklet Portal v0.1.0
      </p>
    </div>
  );
}
