import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
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
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);

  useTauriWindow();

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  return (
    <div
      className={`flex flex-col bg-white transition-all duration-200 ease-out ${
        mode === "mini" ? "rounded-xl shadow-lg" : "rounded-2xl shadow-xl"
      }`}
      style={{ height: "100vh" }}
    >
      {mode === "expanded" && (
        <div className="text-center pt-5 pb-2">
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">inklet</h1>
          <p className="text-[11px] text-gray-400">Portal</p>
        </div>
      )}

      <div className="px-4 py-2">
        <InputBar />
      </div>

      {mode === "expanded" && (
        <div className="px-4 pb-2">
          <PushModeSelector />
        </div>
      )}

      <StatusIndicator />

      {mode === "expanded" && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <ViewContent />
          </div>
          <BottomNav />
        </>
      )}
    </div>
  );
}
