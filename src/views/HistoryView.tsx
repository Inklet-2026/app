import { useEffect } from "react";
import { useHistoryStore } from "../stores/historyStore";

export default function HistoryView() {
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);
  const filteredRecords = useHistoryStore((s) => s.filteredRecords);
  const searchQuery = useHistoryStore((s) => s.searchQuery);
  const setSearchQuery = useHistoryStore((s) => s.setSearchQuery);
  const filterMode = useHistoryStore((s) => s.filterMode);
  const setFilterMode = useHistoryStore((s) => s.setFilterMode);
  const isLoading = useHistoryStore((s) => s.isLoading);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const records = filteredRecords();

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none"
      />

      <div className="flex gap-1 text-xs">
        {([null, "auto", "manual"] as const).map((m) => (
          <button key={String(m)} onClick={() => setFilterMode(m)}
            className={`px-2 py-0.5 rounded ${filterMode === m ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
          >{m ?? "All"}</button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-xs text-gray-400 text-center">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-xs text-gray-400 text-center">No results</p>
      ) : (
        records.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{r.content}</p>
              <p className="text-[11px] text-gray-400">
                {new Date(r.createdAt).toLocaleDateString()}
                {r.deviceName && ` → ${r.deviceName}`}
                <span className="ml-1 text-gray-300">({r.pushMode})</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
