import { useAppStore } from "../stores/appStore";
import type { ActiveTab } from "../types";

const tabs: { key: ActiveTab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "history", label: "History" },
  { key: "devices", label: "Devices" },
  { key: "sources", label: "Sources" },
  { key: "settings", label: "Settings" },
];

export default function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav className="flex justify-around items-center border-t border-gray-100 px-4 py-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === tab.key ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium">
            {tab.label.slice(0, 2)}
          </span>
          <span className="text-[10px]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
