import { useState, useEffect } from "react";
import { SiObsidian, SiLogseq, SiNotion } from "react-icons/si";
import { TbBrandCraft } from "react-icons/tb";

interface VaultConfig {
  path: string;
  name: string;
  totalDocs: number;
  syncedDocs: number;
  autoSyncNew: boolean;
  syncing: boolean;
}

interface SourceState {
  obsidian: VaultConfig | null;
  logseq: VaultConfig | null;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: "50%",
      background: active ? "#34A853" : "var(--border)",
      flexShrink: 0,
    }} />
  );
}

function SourceRow({ name, icon, config, onConnect, onDisconnect, onToggleAutoSync, onExpandChange, comingSoon }: {
  name: string;
  icon: React.ReactNode;
  config: VaultConfig | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onToggleAutoSync?: (v: boolean) => void;
  onExpandChange?: (expanded: boolean) => void;
  comingSoon?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(next);
  }

  if (comingSoon) {
    return (
      <div style={{
        padding: "7px 8px", display: "flex", alignItems: "center", gap: 8,
        opacity: 0.35,
      }}>
        <span style={{ fontSize: 14, display: "flex" }}>{icon}</span>
        <span style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>{name}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>coming soon</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => config ? toggleExpand() : onConnect?.()}
        style={{
          width: "100%", padding: "7px 8px", display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer",
          borderRadius: 6, fontFamily: "var(--font-sans)", textAlign: "left",
          transition: "background 80ms",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
      >
        <span style={{ fontSize: 14, display: "flex" }}>{icon}</span>
        <span style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>{name}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {config ? `${config.syncedDocs}/${config.totalDocs}` : "connect"}
        </span>
        <StatusDot active={!!config} />
        {config && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 150ms", color: "var(--text-muted)" }}>
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {config && expanded && (
        <div style={{ padding: "2px 8px 6px 30px", display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Path + disconnect on same row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={{
              fontSize: 10, color: "var(--text-muted)", flex: 1, minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              direction: "rtl" as const, textAlign: "left" as const,
            }}>
              {config.path}
            </span>
            <button onClick={onDisconnect} style={{
              fontSize: 10, color: "#8B4444", background: "none",
              border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
              padding: 0, flexShrink: 0,
            }}>
              Disconnect
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--text)" }}>Auto-sync new docs</span>
            <button style={{
              width: 32, height: 18, borderRadius: 9, cursor: "pointer",
              background: config.autoSyncNew ? "var(--accent)" : "var(--border)",
              transition: "background 150ms", position: "relative",
              border: "none", padding: 0, flexShrink: 0,
            }} onClick={() => onToggleAutoSync?.(!config.autoSyncNew)}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                background: "white", position: "absolute", top: 2,
                left: config.autoSyncNew ? 16 : 2, transition: "left 150ms",
              }} />
            </button>
          </div>

          <button
            onClick={() => (window as any).electronAPI?.openSourceDocs(name.toLowerCase())}
            style={{
              fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-input)",
              border: "1px solid var(--border)", borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", fontFamily: "var(--font-sans)",
              textAlign: "center", transition: "background 80ms",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-input)"}
          >
            Select documents...
          </button>
        </div>
      )}
    </div>
  );
}

const SYNC_OPTIONS = ["Manual", "12h", "1d", "1w"];

function SyncFrequency() {
  const [freq, setFreq] = useState("1d");

  useEffect(() => {
    (window as any).electronAPI?.getSyncFrequency?.().then((f: string) => { if (f) setFreq(f); });
  }, []);

  function handleChange(f: string) {
    setFreq(f);
    (window as any).electronAPI?.setSyncFrequency(f);
  }

  return (
    <div style={{ padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, color: "var(--text)" }}>Sync</span>
      <div style={{ display: "flex", gap: 2, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
        {SYNC_OPTIONS.map((o) => (
          <button
            key={o}
            onClick={() => handleChange(o)}
            style={{
              fontSize: 10, padding: "3px 7px", border: "none", cursor: "pointer",
              background: freq === o ? "var(--accent)" : "transparent",
              color: freq === o ? "var(--bg)" : "var(--text-muted)",
              fontFamily: "var(--font-sans)", fontWeight: freq === o ? 500 : 400,
              transition: "all 100ms",
            }}
          >{o}</button>
        ))}
      </div>
    </div>
  );
}

function SyncButton() {
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");

  async function handleSync() {
    if (state !== "idle") return;
    setState("syncing");
    try {
      await (window as any).electronAPI?.syncAll();
    } catch { /* ignore */ }
    setState("done");
    setTimeout(() => setState("idle"), 1200);
  }

  return (
    <button onClick={handleSync} style={{
      fontSize: 10, border: "none", cursor: state === "idle" ? "pointer" : "default",
      background: "none", fontFamily: "var(--font-sans)",
      color: state === "done" ? "#34A853" : "var(--text-muted)",
      display: "flex", alignItems: "center", gap: 3,
      padding: 0, transition: "color 200ms",
    }}>
      {state === "syncing" ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ animation: "spin 600ms linear infinite" }}>
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" opacity="0.25"/>
            <path d="M8.5 5a3.5 3.5 0 0 0-3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Syncing...
        </>
      ) : state === "done" ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.5l2.5 2.5 3.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="12" strokeDashoffset="12" style={{ animation: "checkDraw 400ms ease-out forwards" }}/>
          </svg>
          Synced
        </>
      ) : "Sync"}
    </button>
  );
}

const H_BASE = 185;
const H_EXPANDED = 90;

export default function SourcesPopup() {
  const [sources, setSources] = useState<SourceState>({ obsidian: null, logseq: null });
  const [expandedCount, setExpandedCount] = useState(0);

  useEffect(() => {
    (window as any).electronAPI?.getSources?.().then((s: SourceState) => {
      if (s) setSources(s);
    });
  }, []);

  useEffect(() => {
    const h = H_BASE + expandedCount * H_EXPANDED;
    (window as any).electronAPI?.resizePopup(h);
  }, [expandedCount]);

  async function connectSource(type: "obsidian" | "logseq") {
    const result = await (window as any).electronAPI?.selectFolder();
    if (!result) return;
    const updated = await (window as any).electronAPI?.connectSource(type, result);
    const config: VaultConfig = {
      path: result, name: result.split("/").pop() || type,
      totalDocs: updated?.totalDocs ?? 0, syncedDocs: updated?.syncedDocs ?? 0,
      autoSyncNew: true, syncing: false,
    };
    setSources((s) => ({ ...s, [type]: config }));
  }

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12, padding: "8px 6px",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "2px 8px 3px",
      }}>
        <span style={{
          fontSize: 10, color: "var(--text-muted)", margin: 0,
          textTransform: "uppercase" as const, letterSpacing: "0.06em",
        }}>
          Sources
        </span>
        <SyncButton />
      </div>

      <SourceRow
        name="Obsidian" icon={<SiObsidian />} config={sources.obsidian}
        onConnect={() => connectSource("obsidian")}
        onDisconnect={() => {
          (window as any).electronAPI?.disconnectSource("obsidian");
          setSources((s) => ({ ...s, obsidian: null }));
        }}
        onToggleAutoSync={(v) => {
          if (sources.obsidian) {
            setSources((s) => ({ ...s, obsidian: { ...s.obsidian!, autoSyncNew: v } }));
            (window as any).electronAPI?.updateSourceConfig("obsidian", { autoSyncNew: v });
          }
        }}
        onExpandChange={(exp) => setExpandedCount((c) => c + (exp ? 1 : -1))}
      />

      <SourceRow
        name="Logseq" icon={<SiLogseq />} config={sources.logseq}
        onConnect={() => connectSource("logseq")}
        onDisconnect={() => {
          (window as any).electronAPI?.disconnectSource("logseq");
          setSources((s) => ({ ...s, logseq: null }));
        }}
        onToggleAutoSync={(v) => {
          if (sources.logseq) {
            setSources((s) => ({ ...s, logseq: { ...s.logseq!, autoSyncNew: v } }));
            (window as any).electronAPI?.updateSourceConfig("logseq", { autoSyncNew: v });
          }
        }}
        onExpandChange={(exp) => setExpandedCount((c) => c + (exp ? 1 : -1))}
      />

      <SourceRow name="Notion" icon={<SiNotion />} config={null} comingSoon />
      <SourceRow name="Craft" icon={<TbBrandCraft />} config={null} comingSoon />

      <SyncFrequency />
    </div>
  );
}
