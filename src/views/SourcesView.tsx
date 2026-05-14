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

  if (isLoading) return <p className="text-xs text-gray-400 text-center py-4">Loading...</p>;

  return (
    <div className="flex flex-col gap-3">
      {sources.map((s) => (
        <div key={s.id} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">{s.label}</span>
            {s.connected ? (
              <button onClick={() => disconnectSource(s.id)}
                className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-500">Disconnect</button>
            ) : (
              <button onClick={() => connectSource(s.provider)}
                className="text-[10px] px-2 py-0.5 rounded bg-gray-900 text-white">Connect</button>
            )}
          </div>
          {s.connected && s.syncItems.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {s.syncItems.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
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
