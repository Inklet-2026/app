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
    <div className="flex flex-col gap-2 text-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPushMode("auto")}
          className={`px-3 py-1 rounded-md ${pushMode === "auto" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Auto</button>
        <button
          onClick={() => setPushMode("manual")}
          className={`px-3 py-1 rounded-md ${pushMode === "manual" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
        >Manual</button>
      </div>
      {pushMode === "manual" && (
        <div className="flex flex-col gap-2">
          <select
            value={selectedDeviceId ?? ""}
            onChange={(e) => setSelectedDeviceId(e.target.value || null)}
            className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-gray-700 outline-none"
          >
            <option value="">Select device...</option>
            {devices.filter((d) => d.status === "online").map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1">
            {DURATIONS.map((d) => (
              <button key={d} onClick={() => setSelectedDuration(d)}
                className={`px-2 py-0.5 rounded ${selectedDuration === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
              >{DURATION_LABELS[d]}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
