export default function Header() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      height: 32,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 300, fontSize: 17,
          color: "var(--text)", letterSpacing: "-0.01em",
        }}>
          inklet
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 500, fontSize: 9.5,
          color: "var(--text-muted)",
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
        }}>
          Portal
        </span>
      </div>

      {/* Right: login + settings */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
          padding: 0,
        }}>
          Login
        </button>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", padding: 0,
          display: "flex", alignItems: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.17 3.17l1.06 1.06M11.77 11.77l1.06 1.06M3.17 12.83l1.06-1.06M11.77 4.23l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
