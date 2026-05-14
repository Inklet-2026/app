import { useRef, useEffect } from "react";
import { usePushStore } from "../stores/pushStore";
import { useAppStore } from "../stores/appStore";

export default function InputBar() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const content = usePushStore((s) => s.content);
  const setContent = usePushStore((s) => s.setContent);
  const isSubmitting = usePushStore((s) => s.isSubmitting);
  const submit = usePushStore((s) => s.submit);

  useEffect(() => {
    if (mode === "expanded") ref.current?.focus();
  }, [mode]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  if (mode === "mini") {
    return (
      <div
        className="flex items-center gap-2.5 cursor-text"
        style={{
          background: "var(--bg-input)",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          padding: "8px 12px",
        }}
        onClick={toggleMode}
        data-tauri-drag-region
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="flex-1 text-[13px] truncate" style={{ color: "var(--text-muted)" }}>
          Push content to device...
        </span>
        <button
          className="flex items-center justify-center transition-opacity"
          style={{
            width: 26, height: 26, borderRadius: 7,
            background: "var(--accent)", color: "var(--bg)", flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10V2M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2.5"
      style={{
        background: "var(--bg-input)",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        padding: "10px 12px",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5" style={{ flexShrink: 0, opacity: 0.3 }}>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <textarea
        ref={ref}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Push content to device..."
        rows={1}
        className="flex-1 bg-transparent text-[13px] resize-none outline-none"
        style={{
          color: "var(--text)",
          minHeight: 20, maxHeight: 80,
          lineHeight: "1.5",
        }}
      />
      <button
        onClick={submit}
        disabled={isSubmitting || !content.trim()}
        className="flex items-center justify-center transition-opacity disabled:opacity-30"
        style={{
          width: 26, height: 26, borderRadius: 7,
          background: "var(--accent)", color: "var(--bg)", flexShrink: 0,
        }}
      >
        {isSubmitting ? (
          <span className="text-[10px]">...</span>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10V2M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}
