import { useEffect } from "react";
import { useSourceStore } from "../stores/sourceStore";

export default function SourcesView() {
  const sources = useSourceStore((s) => s.sources);
  const isLoading = useSourceStore((s) => s.isLoading);
  const fetchSources = useSourceStore((s) => s.fetchSources);
  const toggleItem = useSourceStore((s) => s.toggleItem);
  const connectSource = useSourceStore((s) => s.connectSource);
  const disconnectSource = useSourceStore((s) => s.disconnectSource);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  if (isLoading) return <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      {sources.map((s) => (
        <div key={s.id} className="p-3 rounded-lg" style={{ background: "var(--bg-card)", borderRadius: 8 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{s.label}</span>
            {s.connected ? (
              <button onClick={() => disconnectSource(s.id)}
                className="text-[10px] px-2 py-0.5 rounded"
                style={{ background: "#F0E8E8", color: "#8B4444" }}>Disconnect</button>
            ) : (
              <button onClick={() => connectSource(s.provider)}
                className="text-[10px] px-2 py-0.5 rounded"
                style={{ background: "var(--accent)", color: "var(--bg)" }}>Connect</button>
            )}
          </div>
          {s.connected && s.syncItems.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {s.syncItems.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={item.enabled}
                    onChange={(e) => toggleItem(s.id, item.id, e.target.checked)}
                    className="rounded" />
                  {item.name}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
