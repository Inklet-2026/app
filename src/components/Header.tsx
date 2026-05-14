export default function Header() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      height: 42,
      padding: "0 14px 0 76px",
      position: "relative",
    }}>
      {/* Brand — centered absolutely */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "baseline",
        gap: 5, pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)", fontWeight: 300,
          fontSize: 16, color: "var(--text)", letterSpacing: "-0.01em",
        }}>
          inklet
        </span>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 500,
          fontSize: 9, color: "var(--text-muted)",
          letterSpacing: "0.14em", textTransform: "uppercase" as const,
        }}>
          Portal
        </span>
      </div>

      {/* Right side — login + settings */}
      <div style={{
        marginLeft: "auto", display: "flex",
        alignItems: "center", gap: 10, zIndex: 1,
      }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)", padding: 0,
        }}>
          Login
        </button>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", padding: 0,
          display: "flex", alignItems: "center",
        }} title="Settings">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M6.1 1.5h2.8l.4 1.7.8.3 1.5-.8 2 2-.8 1.5.3.8 1.7.4v2.8l-1.7.4-.3.8.8 1.5-2 2-1.5-.8-.8.3-.4 1.7H6.1l-.4-1.7-.8-.3-1.5.8-2-2 .8-1.5-.3-.8L.2 9.1V6.3l1.7-.4.3-.8-.8-1.5 2-2 1.5.8.8-.3z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
            <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
