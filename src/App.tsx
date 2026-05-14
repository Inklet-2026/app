import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./stores/authStore";
import { useTauriWindow } from "./hooks/useTauriWindow";
import { useDeviceStore } from "./stores/deviceStore";
import InputBar from "./components/InputBar";
import StatusIndicator from "./components/StatusIndicator";
import BottomNav from "./components/BottomNav";
import HomeView from "./views/HomeView";
import HistoryView from "./views/HistoryView";
import DevicesView from "./views/DevicesView";
import SourcesView from "./views/SourcesView";
import SettingsView from "./views/SettingsView";

function ViewContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  switch (activeTab) {
    case "home": return <HomeView />;
    case "history": return <HistoryView />;
    case "devices": return <DevicesView />;
    case "sources": return <SourcesView />;
    case "settings": return <SettingsView />;
  }
}

function PortalHeader() {
  const user = useAuthStore((s) => s.user);
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div
      data-tauri-drag-region
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px 6px",
        background: "var(--bg)",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          WebkitAppRegion: "drag",
        } as React.CSSProperties}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 300,
            fontSize: 16,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          inklet
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          PORTAL
        </span>
      </div>

      {/* Avatar */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
          }}
          title={user?.name ?? "Account"}
        >
          {avatarLetter}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const mode = useAppStore((s) => s.mode);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);

  useTauriWindow();

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: mode === "mini" ? "transparent" : "var(--bg)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}
    >
      {mode === "mini" ? (
        /* Mini mode: transparent top spacer + input bar */
        <>
          <div style={{ height: 8, flexShrink: 0 }} />
          <div style={{ padding: "0 0 8px", flexShrink: 0 }}>
            <InputBar />
          </div>
        </>
      ) : (
        /* Expanded mode: custom header + input + content + nav */
        <>
          <PortalHeader />

          <div style={{ padding: "0 16px", flexShrink: 0 }}>
            <InputBar />
          </div>

          <div
            className="expanded-content-enter"
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <StatusIndicator />

            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              <ViewContent />
            </div>

            <BottomNav />
          </div>
        </>
      )}
    </div>
  );
}
