import { useState } from "react";
import { useAuthStore } from "../stores/authStore";

export default function SettingsView() {
  const [tab, setTab] = useState<"settings" | "account">("settings");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 text-xs">
        <button onClick={() => setTab("settings")}
          className="px-3 py-1 rounded-md"
          style={tab === "settings"
            ? { background: "var(--accent)", color: "var(--bg)" }
            : { background: "var(--bg-card)", color: "var(--text-secondary)" }}
        >Settings</button>
        <button onClick={() => setTab("account")}
          className="px-3 py-1 rounded-md"
          style={tab === "account"
            ? { background: "var(--accent)", color: "var(--bg)" }
            : { background: "var(--bg-card)", color: "var(--text-secondary)" }}
        >Account</button>
      </div>

      {tab === "settings" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "var(--bg-card)", borderRadius: 8 }}>
            <div>
              <p className="text-sm" style={{ color: "var(--text)" }}>Hotkey</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Activate Inklet Portal</p>
            </div>
            <span className="text-xs px-2 py-1 rounded font-mono"
              style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>⌘L</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "var(--bg-card)", borderRadius: 8 }}>
            <div>
              <p className="text-sm" style={{ color: "var(--text)" }}>Launch on startup</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Start when you log in</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "var(--bg-card)", borderRadius: 8 }}>
            <div>
              <p className="text-sm" style={{ color: "var(--text)" }}>Theme</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Appearance preference</p>
            </div>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>System</span>
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "var(--bg-card)", borderRadius: 8 }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                  style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{user.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "var(--bg-card)", borderRadius: 8 }}>
                <p className="text-sm" style={{ color: "var(--text)" }}>Plan</p>
                <span className="text-xs px-2 py-0.5 rounded"
                  style={{ background: "var(--accent)", color: "var(--bg)" }}>{user.plan}</span>
              </div>
              <button onClick={logout}
                className="text-sm text-center py-2"
                style={{ color: "#8B4444" }}>Sign out</button>
            </>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Not signed in</p>
          )}
        </div>
      )}
    </div>
  );
}
