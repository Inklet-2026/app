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
    return <p className="text-xs text-gray-400 text-center py-4">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400 font-medium">Recent pushes</p>
      {records.map((r) => (
        <div key={r.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 shrink-0">
            {r.contentType === "url" ? "🔗" : r.contentType === "image" ? "🖼" : "📝"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 truncate">{r.content}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {timeAgo(r.createdAt)}
              {r.pushMode === "manual" && r.deviceName && ` → ${r.deviceName}`}
              {r.pushMode === "manual" && r.expiresAt && (
                <span className="text-amber-500 ml-1">{remainingTime(r.expiresAt)}</span>
              )}
            </p>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            r.status === "distributed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          }`}>
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}
