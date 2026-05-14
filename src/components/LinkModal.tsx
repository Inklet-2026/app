import { useState, useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
  onSubmit: (url: string, hostname: string) => void;
}

export default function LinkModal({ onClose, onSubmit }: Props) {
  const [url, setUrl] = useState("https://");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit() {
    try {
      const hostname = new URL(url).hostname;
      onSubmit(url, hostname);
    } catch {
      /* invalid URL */
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
          style={{
            width: "100%", fontSize: 13, padding: "8px 10px",
            borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--bg-input)", outline: "none",
            color: "var(--text)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--text-muted)", padding: "6px 12px",
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            background: "var(--accent)", color: "var(--bg)",
            border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 500, padding: "6px 14px",
            borderRadius: 6,
          }}>Fetch</button>
        </div>
      </div>
    </div>
  );
}
