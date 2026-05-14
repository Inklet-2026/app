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

function WindowControls() {
  return (
    <div className="flex items-center gap-[7px] pl-3 pt-3" data-tauri-drag-region>
      <button
        onClick={() => {
          import("@tauri-apps/api/core").then(({ invoke }) => invoke("hide_window"));
        }}
        className="w-[13px] h-[13px] rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
      />
      <button className="w-[13px] h-[13px] rounded-full bg-[#FEBC2E] hover:brightness-90 transition-all" />
      <button
        onClick={() => {
          useAppStore.getState().toggleMode();
        }}
        className="w-[13px] h-[13px] rounded-full bg-[#28C840] hover:brightness-90 transition-all"
      />
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
      className="flex flex-col transition-all duration-200 ease-out"
      style={{
        height: "100vh",
        background: "var(--bg)",
        borderRadius: mode === "mini" ? "14px" : "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {mode === "expanded" && <WindowControls />}

      {mode === "expanded" && (
        <div className="text-center pt-4 pb-3" data-tauri-drag-region>
          <h1
            className="text-[22px] tracking-[0.02em]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300, color: "var(--text)" }}
          >
            inklet
          </h1>
          <p
            className="text-[11px] tracking-[0.15em] uppercase mt-0.5"
            style={{ color: "var(--text-muted)", fontWeight: 400 }}
          >
            Portal
          </p>
        </div>
      )}

      <div className={mode === "mini" ? "px-3 py-2" : "px-5 pb-3"}>
        <InputBar />
      </div>

      {mode === "expanded" && (
        <div className="px-5 pb-3">
          <PushModeSelector />
        </div>
      )}

      <StatusIndicator />

      {mode === "expanded" && (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-2">
            <ViewContent />
          </div>
          <BottomNav />
        </>
      )}
    </div>
  );
}
