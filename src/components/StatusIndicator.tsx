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
    <div
      className="mx-5 mb-2 px-3 py-2 text-[12px]"
      style={{
        background: "#E8F0E8",
        border: "1px solid #C8D8C8",
        borderRadius: 8,
        color: "#3A6A3A",
      }}
    >
      Pushed: {lastResult.content.slice(0, 50)}
      {lastResult.content.length > 50 ? "..." : ""}
      {lastResult.pushMode === "manual" && lastResult.deviceName && (
        <span style={{ opacity: 0.7 }}> → {lastResult.deviceName}</span>
      )}
    </div>
  );
}
