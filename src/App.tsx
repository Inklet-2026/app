import { useAppStore } from "./stores/appStore";
import { useTauriWindow } from "./hooks/useTauriWindow";
import BottomNav from "./components/BottomNav";

function ViewContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <p className="text-sm text-gray-400">{activeTab} view</p>
    </div>
  );
}

export default function App() {
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);

  useTauriWindow();

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
        <div
          className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 cursor-text"
          onClick={() => { if (mode === "mini") toggleMode(); }}
        >
          <span className="text-gray-300 text-sm">+</span>
          <span className="flex-1 text-gray-400 text-sm">Push content to device...</span>
          <span className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white text-xs">
            ↑
          </span>
        </div>
      </div>

      {mode === "expanded" && (
        <>
          <ViewContent />
          <BottomNav />
        </>
      )}
    </div>
  );
}
