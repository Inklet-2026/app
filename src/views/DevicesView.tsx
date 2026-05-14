import { useEffect } from "react";
import { useDeviceStore } from "../stores/deviceStore";

function remainingTime(manualUntil: string | null): string | null {
  if (!manualUntil) return null;
  const diff = new Date(manualUntil).getTime() - Date.now();
  if (diff <= 0) return null;
  const hrs = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function DevicesView() {
  const devices = useDeviceStore((s) => s.devices);
  const isLoading = useDeviceStore((s) => s.isLoading);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  if (isLoading) return <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Loading...</p>;

  return (
    <div className="flex flex-col gap-2">
      {devices.map((d) => {
        const remaining = remainingTime(d.manualUntil);
        return (
          <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: "var(--bg-card)", borderRadius: 8 }}>
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: d.status === "online" ? "#28C840" : "var(--border)" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{d.name}</p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {d.currentContent ?? "No content"}
                {remaining && <span className="ml-1" style={{ color: "#B8860B" }}>(manual: {remaining})</span>}
              </p>
            </div>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{d.status}</span>
          </div>
        );
      })}
    </div>
  );
}
