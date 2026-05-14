import { useState, useEffect, useRef } from "react";
import type { OgData } from "../types";

interface Props {
  onClose: () => void;
  onSubmit: (og: OgData) => void;
}

export default function LinkModal({ onClose, onSubmit }: Props) {
  const [url, setUrl] = useState("https://");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
    try {
      new URL(url);
    } catch {
      return;
    }
    setLoading(true);
    try {
      const og: OgData = await (window as any).electronAPI.fetchOg(url);
      onSubmit(og);
    } catch {
      const hostname = new URL(url).hostname;
      onSubmit({ title: hostname, description: "", image: null, url, hostname });
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.08)", zIndex: 100,
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", borderRadius: 12,
          padding: "16px 18px", width: 340,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px", color: "var(--text)" }}>
          Add link
        </p>
        <input
          ref={ref}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          disabled={loading}
          style={{
            width: "100%", fontSize: 13, padding: "8px 10px",
            borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--bg-input)", outline: "none",
            color: "var(--text)", opacity: loading ? 0.6 : 1,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onClose} disabled={loading} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--text-muted)", padding: "6px 12px",
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: "var(--accent)", color: "var(--bg)",
            border: "none", cursor: loading ? "wait" : "pointer",
            fontSize: 12, fontWeight: 500, padding: "6px 14px",
            borderRadius: 6, opacity: loading ? 0.6 : 1,
          }}>{loading ? "Fetching..." : "Fetch"}</button>
        </div>
      </div>
    </div>
  );
}
