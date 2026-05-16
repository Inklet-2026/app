export default function SettingsPopup() {
  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12, padding: 14,
      height: "100vh", display: "flex", flexDirection: "column", gap: 2,
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontSize: 10, color: "var(--text-muted)", padding: "2px 6px",
        margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.06em",
      }}>
        Settings
      </p>

      {/* Hotkey */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 8px", borderRadius: 6,
      }}>
        <span style={{ fontSize: 12, color: "var(--text)" }}>Hotkey</span>
        <span style={{
          fontSize: 11, color: "var(--text-muted)", background: "var(--bg-input)",
          padding: "2px 8px", borderRadius: 4, fontFamily: "monospace",
        }}>⌘ L</span>
      </div>

      {/* Account */}
      <button
        onClick={() => {
          (window as any).electronAPI?.openExternal("https://www.iminklet.com");
        }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 8px", borderRadius: 6, width: "100%",
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left", fontFamily: "var(--font-sans)",
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

      {/* Version */}
      <p style={{
        fontSize: 10, color: "var(--text-muted)", textAlign: "center",
        margin: 0, padding: "4px 0 2px", opacity: 0.6,
      }}>
        inklet Portal v0.1.0
      </p>
    </div>
  );
}
