import { useEffect } from "react";
import { usePushStore } from "../stores/pushStore";

export default function StatusIndicator() {
  const lastResult = usePushStore((s) => s.lastResult);
  const clearResult = usePushStore((s) => s.clearResult);

  useEffect(() => {
    if (lastResult) {
      const t = setTimeout(clearResult, 3000);
      return () => clearTimeout(t);
    }
  }, [lastResult, clearResult]);

  if (!lastResult) return null;

  return (
    <div className="mx-4 mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
      Pushed: {lastResult.content.slice(0, 50)}{lastResult.content.length > 50 ? "..." : ""}
      {lastResult.pushMode === "manual" && lastResult.deviceName && (
        <span className="text-green-500"> → {lastResult.deviceName}</span>
      )}
    </div>
  );
}
