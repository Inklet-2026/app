import { useAppStore } from "../stores/appStore";
import type { ActiveTab } from "../types";

const tabs: { key: ActiveTab; label: string; icon: JSX.Element }[] = [
  {
    key: "home", label: "Home",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 7.5L9 3l6 4.5V15a1 1 0 01-1 1H4a1 1 0 01-1-1V7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    key: "history", label: "History",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.2"/><path d="M9 6v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    key: "devices", label: "Devices",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 15h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
  {
    key: "sources", label: "Sources",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  },
  {
    key: "settings", label: "Settings",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  },
];

export default function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav
      className="flex justify-around items-center py-2.5"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{
            color: activeTab === tab.key ? "var(--text)" : "var(--text-muted)",
            opacity: activeTab === tab.key ? 1 : 0.5,
          }}
        >
          {tab.icon}
          <span className="text-[9px] tracking-[0.03em]">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
