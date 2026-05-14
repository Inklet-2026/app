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
        className="rounded-md px-3 py-1.5 text-sm outline-none"
        style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }}
      />

      <div className="flex gap-1 text-xs">
        {([null, "auto", "manual"] as const).map((m) => (
          <button key={String(m)} onClick={() => setFilterMode(m)}
            className="px-2 py-0.5 rounded"
            style={filterMode === m
              ? { background: "var(--accent)", color: "var(--bg)" }
              : { background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >{m ?? "All"}</button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>No results</p>
      ) : (
        records.map((r) => (
          <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg"
            style={{ background: "var(--bg-card)", borderRadius: 8 }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: "var(--text)" }}>{r.content}</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {new Date(r.createdAt).toLocaleDateString()}
                {r.deviceName && ` → ${r.deviceName}`}
                <span className="ml-1" style={{ color: "var(--border)" }}>({r.pushMode})</span>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
