import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useAppStore } from "../stores/appStore";

export function useTauriWindow() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  useEffect(() => {
    invoke("set_window_mode", { mode }).catch(console.error);
  }, [mode]);

  useEffect(() => {
    const unlisten = listen<string>("navigate", (event) => {
      if (event.payload === "settings") setActiveTab("settings");
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [setActiveTab]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMode("mini");
        invoke("hide_window").catch(console.error);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setMode]);
}
