import { useState, useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
  onSubmit: (url: string, hostname: string) => void;
}

export default function LinkModal({ onClose, onSubmit }: Props) {
  const [url, setUrl] = useState("https://");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(url.length, url.length);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed || trimmed === "https://") return;
    try {
      const hostname = new URL(trimmed).hostname;
      onSubmit(trimmed, hostname);
    } catch {
      // Invalid URL — use raw input as hostname fallback
      onSubmit(trimmed, trimmed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 101,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 16,
          width: 300,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text)",
          }}
        >
          Enter URL
        </p>

        <input
          ref={inputRef}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 13,
            color: "var(--text)",
            outline: "none",
            fontFamily: "var(--font-sans)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              border: "none",
              background: "var(--accent)",
              color: "var(--bg)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            Fetch
          </button>
        </div>
      </div>
    </>
  );
}
