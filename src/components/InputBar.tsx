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
  const pushMode = usePushStore((s) => s.pushMode);
  const setPushMode = usePushStore((s) => s.setPushMode);

  useEffect(() => {
    if (mode === "expanded") ref.current?.focus();
  }, [mode]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleClick() {
    if (mode === "mini") toggleMode();
  }

  return (
    <div
      onClick={handleClick}
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        cursor: mode === "mini" ? "text" : undefined,
      }}
    >
      <div style={{ padding: "14px 16px 0 16px", flex: 1 }}>
        {mode === "mini" ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, lineHeight: "1.4" }}>
            Push content to device...
          </p>
        ) : (
          <textarea
            ref={ref}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Push content to device..."
            rows={2}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 14,
              lineHeight: "1.4",
              color: "var(--text)",
              padding: 0,
              margin: 0,
              minHeight: 40,
              maxHeight: 60,
            }}
          />
        )}
      </div>

      <div
        style={{
          padding: "8px 12px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3.5v7M3.5 7h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          {(["auto", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={(e) => { e.stopPropagation(); setPushMode(m); if (mode === "mini") toggleMode(); }}
              className="capitalize"
              style={{
                fontSize: 12, padding: "4px 10px", borderRadius: 6,
                border: "none", cursor: "pointer",
                background: pushMode === m ? "var(--accent)" : "transparent",
                color: pushMode === m ? "var(--bg)" : "var(--text-muted)",
                fontWeight: pushMode === m ? 500 : 400,
                fontFamily: "var(--font-sans)",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); submit(); }}
          disabled={isSubmitting || !content.trim()}
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: "var(--accent)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--bg)", cursor: "pointer",
            opacity: isSubmitting || !content.trim() ? 0.3 : 1,
            transition: "opacity 150ms",
          }}
        >
          {isSubmitting ? (
            <span style={{ fontSize: 10 }}>...</span>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10V2M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
