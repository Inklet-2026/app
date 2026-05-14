import { useEffect, useState } from "react";
import { usePushStore } from "../stores/pushStore";
import { api } from "../api/client";
import type { PushRecord } from "../types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function remainingTime(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

const typeIcon: Record<string, string> = { url: "🔗", image: "🖼", text: "📝", file: "📄" };

export default function HomeView() {
  const [records, setRecords] = useState<PushRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const lastResult = usePushStore((s) => s.lastResult);

  useEffect(() => {
    api.getHistory().then(({ records }) => {
      setRecords(records);
      setLoading(false);
    });
  }, [lastResult]);

  if (loading) {
    return <p className="text-[12px] text-center py-6" style={{ color: "var(--text-muted)" }}>Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] tracking-[0.05em] uppercase mb-1" style={{ color: "var(--text-muted)" }}>
        Recent pushes
      </p>
      {records.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 p-2.5"
          style={{ background: "var(--bg-card)", borderRadius: 8 }}
        >
          <div
            className="flex items-center justify-center text-[14px] shrink-0"
            style={{ width: 32, height: 32, borderRadius: 7, background: "var(--bg-input)" }}
          >
            {typeIcon[r.contentType] ?? "📝"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] truncate" style={{ color: "var(--text)" }}>{r.content}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {timeAgo(r.createdAt)}
              {r.pushMode === "manual" && r.deviceName && ` → ${r.deviceName}`}
              {r.pushMode === "manual" && r.expiresAt && (
                <span style={{ color: "#B8860B", marginLeft: 4 }}>{remainingTime(r.expiresAt)}</span>
              )}
            </p>
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5"
            style={{
              borderRadius: 4,
              background: r.status === "distributed" ? "#E8F0E8" : "#F5F0E0",
              color: r.status === "distributed" ? "#3A6A3A" : "#8A7A3A",
            }}
          >
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}
