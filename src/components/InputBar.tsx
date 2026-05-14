import { useRef, useEffect, useState } from "react";
import { usePushStore } from "../stores/pushStore";
import { useAppStore } from "../stores/appStore";
import type { Attachment } from "../types";
import AttachmentList from "./AttachmentList";
import LinkModal from "./LinkModal";

function genId() {
  return Math.random().toString(36).slice(2);
}

export default function InputBar() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const content = usePushStore((s) => s.content);
  const setContent = usePushStore((s) => s.setContent);
  const isSubmitting = usePushStore((s) => s.isSubmitting);
  const submit = usePushStore((s) => s.submit);
  const attachments = usePushStore((s) => s.attachments);
  const addAttachment = usePushStore((s) => s.addAttachment);
  const removeAttachment = usePushStore((s) => s.removeAttachment);

  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    if (mode === "expanded") textareaRef.current?.focus();
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

  async function handleClipboard(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("image/png") || item.types.includes("image/jpeg")) {
          const type = item.types.find((t) => t.startsWith("image/")) ?? "image/png";
          const blob = await item.getType(type);
          const ext = type.split("/")[1];
          const attachment: Attachment = {
            id: genId(),
            type: "image",
            name: `Clipboard.${ext}`,
            preview: URL.createObjectURL(blob),
          };
          addAttachment(attachment);
          return;
        }
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          setContent(content + text);
          return;
        }
      }
    } catch {
      // Clipboard access denied or empty — silently ignore
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const attachment: Attachment = {
      id: genId(),
      type: "image",
      name: file.name,
      preview: URL.createObjectURL(file),
    };
    addAttachment(attachment);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (!blob) continue;
        const ext = items[i].type.split("/")[1];
        const attachment: Attachment = {
          id: genId(),
          type: "image",
          name: `Pasted.${ext}`,
          preview: URL.createObjectURL(blob),
        };
        addAttachment(attachment);
        return;
      }
    }
    // No image — let default textarea paste handle text
  }

  function handleLinkSubmit(url: string, hostname: string) {
    const attachment: Attachment = {
      id: genId(),
      type: "link",
      name: hostname,
      preview: url,
      url,
    };
    addAttachment(attachment);
    setShowLinkModal(false);
  }

  const canSubmit = !isSubmitting && (content.trim().length > 0 || attachments.length > 0);

  const toolButtonStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  };

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          background: mode === "mini" ? "var(--bg)" : "var(--bg-input)",
          border: mode === "mini" ? "none" : "1px solid var(--border)",
          borderRadius: mode === "mini" ? 0 : 12,
          display: "flex",
          flexDirection: "column",
          cursor: mode === "mini" ? "text" : undefined,
          height: mode === "mini" ? "100%" : undefined,
        }}
      >
        {/* Text area */}
        <div style={{ padding: "14px 16px 0 16px", flex: 1 }}>
          {mode === "mini" ? (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                margin: 0,
                lineHeight: "1.4",
              }}
            >
              Push content to device...
            </p>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
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
                minHeight: 50,
                maxHeight: 120,
                boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* Attachment cards */}
        {mode === "expanded" && (
          <AttachmentList attachments={attachments} onRemove={removeAttachment} />
        )}

        {/* Toolbar */}
        <div
          style={{
            padding: "8px 12px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Upload button */}
            <button
              style={toolButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "mini") toggleMode();
                fileInputRef.current?.click();
              }}
              title="Upload image"
              aria-label="Upload image"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 2v7M4 4.5l2.5-2.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 10.5h9"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Clipboard button */}
            <button
              style={toolButtonStyle}
              onClick={handleClipboard}
              title="Paste from clipboard"
              aria-label="Paste from clipboard"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="8"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M5 3V2.5A1.5 1.5 0 0 1 8 2.5V3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Link button */}
            <button
              style={toolButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "mini") toggleMode();
                setShowLinkModal(true);
              }}
              title="Add link"
              aria-label="Add link"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M5.5 7.5a3 3 0 0 0 4.243 0l1.414-1.414a3 3 0 0 0-4.243-4.243L6.5 2.257"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M7.5 5.5a3 3 0 0 0-4.243 0L1.843 6.914a3 3 0 0 0 4.243 4.243L6.5 10.743"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Submit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              submit();
            }}
            disabled={!canSubmit}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--accent)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bg)",
              cursor: canSubmit ? "pointer" : "default",
              opacity: canSubmit ? 1 : 0.3,
              transition: "opacity 150ms",
              padding: 0,
              flexShrink: 0,
            }}
            aria-label="Submit"
          >
            {isSubmitting ? (
              <span style={{ fontSize: 10 }}>...</span>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 10V2M3 5l3-3 3 3"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showLinkModal && (
        <LinkModal onClose={() => setShowLinkModal(false)} onSubmit={handleLinkSubmit} />
      )}
    </>
  );
}
