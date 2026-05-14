import { usePushStore } from "../stores/pushStore";
import { useDeviceStore } from "../stores/deviceStore";
import { DURATION_LABELS } from "../types";
import type { Duration } from "../types";

const DURATIONS: Duration[] = ["10m", "1h", "3h", "12h", "1d", "3d", "1w"];

export default function PushModeSelector() {
  const pushMode = usePushStore((s) => s.pushMode);
  const setPushMode = usePushStore((s) => s.setPushMode);
  const selectedDeviceId = usePushStore((s) => s.selectedDeviceId);
  const setSelectedDeviceId = usePushStore((s) => s.setSelectedDeviceId);
  const selectedDuration = usePushStore((s) => s.selectedDuration);
  const setSelectedDuration = usePushStore((s) => s.setSelectedDuration);
  const devices = useDeviceStore((s) => s.devices);

  return (
    <div className="flex flex-col gap-2.5 text-[12px]">
      <div className="flex items-center gap-1.5">
        {(["auto", "manual"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setPushMode(m)}
            className="px-3 py-[5px] transition-all capitalize"
            style={{
              borderRadius: 7,
              background: pushMode === m ? "var(--accent)" : "var(--bg-card)",
              color: pushMode === m ? "var(--bg)" : "var(--text-secondary)",
              fontWeight: pushMode === m ? 500 : 400,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {pushMode === "manual" && (
        <div className="flex flex-col gap-2">
          <select
            value={selectedDeviceId ?? ""}
            onChange={(e) => setSelectedDeviceId(e.target.value || null)}
            className="outline-none text-[12px]"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 7,
              padding: "5px 8px",
              color: "var(--text-secondary)",
            }}
          >
            <option value="">Select device...</option>
            {devices.filter((d) => d.status === "online").map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className="px-2 py-[3px] transition-all"
                style={{
                  borderRadius: 5,
                  background: selectedDuration === d ? "var(--accent)" : "var(--bg-card)",
                  color: selectedDuration === d ? "var(--bg)" : "var(--text-muted)",
                  fontSize: 11,
                }}
              >
                {DURATION_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
