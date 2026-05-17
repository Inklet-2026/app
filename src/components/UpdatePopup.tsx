import { useState, useEffect } from "react";

export default function UpdatePopup() {
  const params = new URLSearchParams(window.location.search);
  const version = params.get("version") || "";
  const currentVersion = params.get("currentVersion") || "";
  const releaseNotes = params.get("releaseNotes") || "";

  const [state, setState] = useState<"ready" | "downloading" | "done">("ready");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (window as any).electronAPI?.onUpdateProgress?.((pct: number) => {
      setProgress(Math.round(pct));
      setState("downloading");
    });
    (window as any).electronAPI?.onUpdateDownloaded?.(() => {
      setState("done");
    });
  }, []);

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12, padding: "16px 18px",
      height: "100vh", display: "flex", flexDirection: "column",
    }}>
      <p style={{
        fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 400,
        margin: "0 0 4px", color: "var(--text)", textAlign: "center",
      }}>
        A new version is available
      </p>
      <p style={{
        fontSize: 11, color: "var(--text-muted)", textAlign: "center",
        margin: "0 0 12px",
      }}>
        {currentVersion} → <strong style={{ color: "var(--text)" }}>{version}</strong>
      </p>

      {releaseNotes && (
        <div style={{
          flex: 1, overflowY: "auto", padding: "8px 10px", marginBottom: 12,
          background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border)",
          fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)",
          whiteSpace: "pre-wrap" as const,
        }}>
          {releaseNotes}
        </div>
      )}

      {state === "downloading" && (
        <div style={{ marginBottom: 10 }}>
          <div style={{
            height: 4, borderRadius: 2, background: "var(--border)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 2, background: "var(--accent)",
              width: `${progress}%`, transition: "width 200ms",
            }} />
          </div>
          <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", margin: "4px 0 0" }}>
            Downloading... {progress}%
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 6 }}>
        {state === "ready" && (
          <>
            <button
              onClick={() => (window as any).electronAPI?.updateSkip(version)}
              style={{
                flex: 1, padding: "7px", borderRadius: 7, fontSize: 11,
                background: "none", border: "1px solid var(--border)",
                color: "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-sans)",
              }}
            >Skip</button>
            <button
              onClick={() => (window as any).electronAPI?.updateLater()}
              style={{
                flex: 1, padding: "7px", borderRadius: 7, fontSize: 11,
                background: "none", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)",
              }}
            >Later</button>
            <button
              onClick={() => {
                setState("downloading");
                (window as any).electronAPI?.updateInstall();
              }}
              style={{
                flex: 1, padding: "7px", borderRadius: 7, fontSize: 11,
                background: "var(--accent)", border: "none",
                color: "var(--bg)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500,
              }}
            >Update</button>
          </>
        )}
        {state === "done" && (
          <button
            onClick={() => (window as any).electronAPI?.updateRestart()}
            style={{
              flex: 1, padding: "7px", borderRadius: 7, fontSize: 11,
              background: "#34A853", border: "none",
              color: "white", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500,
            }}
          >Restart to Update</button>
        )}
      </div>
    </div>
  );
}
