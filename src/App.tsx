import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import { usePushStore } from "./stores/pushStore";
import { useTauriWindow } from "./hooks/useTauriWindow";
import { useDeviceStore } from "./stores/deviceStore";
import InputBar from "./components/InputBar";
import PushModeSelector from "./components/PushModeSelector";
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

export default function App() {
  const mode = useAppStore((s) => s.mode);
  const pushMode = usePushStore((s) => s.pushMode);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);

  useTauriWindow();

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Spacer for native title bar overlay (traffic lights) */}
      <div style={{ height: 36, flexShrink: 0 }} />

      {/* Input bar — always at the top, position stays fixed during expand */}
      <div style={{ padding: "0 16px", flexShrink: 0 }}>
        <InputBar />
      </div>

      {/* Expanded content — animates in below input bar */}
      {mode === "expanded" && (
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

          {/* Manual mode device/duration selector */}
          {pushMode === "manual" && (
            <div style={{ padding: "8px 16px 0" }}>
              <PushModeSelector />
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            <ViewContent />
          </div>

          <BottomNav />
        </div>
      )}
    </div>
  );
}
