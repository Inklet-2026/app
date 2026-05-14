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
          className={`px-3 py-1 rounded-md ${tab === "settings" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Settings</button>
        <button onClick={() => setTab("account")}
          className={`px-3 py-1 rounded-md ${tab === "account" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Account</button>
      </div>

      {tab === "settings" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-800">Hotkey</p>
              <p className="text-[11px] text-gray-400">Activate Inklet Portal</p>
            </div>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">⌘L</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-800">Launch on startup</p>
              <p className="text-[11px] text-gray-400">Start when you log in</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-800">Theme</p>
              <p className="text-[11px] text-gray-400">Appearance preference</p>
            </div>
            <span className="text-xs text-gray-500">System</span>
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-[11px] text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">Plan</p>
                <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">{user.plan}</span>
              </div>
              <button onClick={logout}
                className="text-sm text-red-500 text-center py-2 hover:text-red-600">Sign out</button>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Not signed in</p>
          )}
        </div>
      )}
    </div>
  );
}
