import { useState, useEffect, useRef } from "react";
import { SiObsidian, SiLogseq, SiNotion, SiCraft } from "react-icons/si";

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

function SourceRow({ name, icon, config, onConnect, onDisconnect, onToggleAutoSync, comingSoon }: {
  name: string;
  icon: React.ReactNode;
  config: VaultConfig | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onToggleAutoSync?: (v: boolean) => void;
  comingSoon?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

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
        onClick={() => config ? setExpanded(!expanded) : onConnect?.()}
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
        <StatusDot active={!!config} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {config ? `${config.syncedDocs}/${config.totalDocs}` : "connect"}
        </span>
        {config && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 150ms", color: "var(--text-muted)" }}>
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {config && expanded && (
        <div style={{ padding: "2px 8px 6px 30px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
            {config.path}
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

          <button onClick={onDisconnect} style={{
            fontSize: 10, color: "#8B4444", background: "none",
            border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
            padding: "2px 0", textAlign: "left",
          }}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default function SourcesPopup() {
  const [sources, setSources] = useState<SourceState>({ obsidian: null, logseq: null });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).electronAPI?.getSources?.().then((s: SourceState) => {
      if (s) setSources(s);
    });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const h = containerRef.current.scrollHeight + 4;
      (window as any).electronAPI?.resizeWindow(260, Math.min(h, 400));
    }
  });

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
    <div ref={containerRef} style={{
      background: "var(--bg)", borderRadius: 12, padding: "8px 6px",
      display: "flex", flexDirection: "column",
      border: "1px solid var(--border)",
    }}>
      <p style={{
        fontSize: 10, color: "var(--text-muted)", padding: "2px 8px 3px", margin: 0,
        textTransform: "uppercase" as const, letterSpacing: "0.06em",
      }}>
        Sources
      </p>

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
      />

      <div style={{ height: 1, background: "var(--border)", margin: "3px 6px" }} />

      <SourceRow name="Notion" icon={<SiNotion />} config={null} comingSoon />
      <SourceRow name="Craft" icon={<SiCraft />} config={null} comingSoon />
    </div>
  );
}
