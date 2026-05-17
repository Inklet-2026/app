import { useRef } from "react";

function SourcesButton() {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      onClick={() => {
        if (ref.current) {
          const r = ref.current.getBoundingClientRect();
          const sx = window.screenX || 0;
          const sy = window.screenY || 0;
          (window as any).electronAPI?.showSourcesPopup(sx + r.right, sy + r.bottom);
        }
      }}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-muted)", padding: 0,
        display: "flex", alignItems: "center",
      }}
      title="Sources"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </button>
  );
}

interface Props {
  username: string | null;
  onLogout: () => void;
  onLoginClick: (x: number, y: number) => void;
}

export default function Header({ username, onLogout, onLoginClick }: Props) {
  const loginRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);

  function handleLoginClick() {
    if (username) {
      (window as any).electronAPI?.openExternal("https://portal.iminklet.com");
    } else if (loginRef.current) {
      const r = loginRef.current.getBoundingClientRect();
      const sx = window.screenX || 0;
      const sy = window.screenY || 0;
      onLoginClick(sx + r.right, sy + r.bottom);
    }
  }

  function handleSettingsClick() {
    if (settingsRef.current) {
      const r = settingsRef.current.getBoundingClientRect();
      const sx = window.screenX || 0;
      const sy = window.screenY || 0;
      (window as any).electronAPI?.showSettingsPopup(sx + r.right, sy + r.bottom);
    }
  }

  return (
    <div style={{
      display: "flex", alignItems: "center",
      height: 36, padding: "0 16px 0 76px", position: "relative",
    }}>
      <div style={{
        position: "absolute", left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "baseline",
        gap: 5, pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)", fontWeight: 400,
          fontSize: 16, color: "var(--text)", letterSpacing: "0.02em",
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

      <div style={{
        marginLeft: "auto", display: "flex",
        alignItems: "center", gap: 10, zIndex: 1,
      }}>
        <button
          ref={loginRef}
          onClick={handleLoginClick}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)", padding: 0,
          }}
        >
          {username ?? "Login"}
        </button>
        {username && (
          <button
            onClick={onLogout}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 10, color: "var(--text-muted)", padding: 0,
              opacity: 0.6,
            }}
          >
            Logout
          </button>
        )}
        <SourcesButton />
        <button
          ref={settingsRef}
          onClick={handleSettingsClick}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 0,
            display: "flex", alignItems: "center",
          }}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
