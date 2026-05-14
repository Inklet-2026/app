import { useRef, useState } from "react";
import type { Attachment } from "../types";
import AttachmentList from "./AttachmentList";
import LinkModal from "./LinkModal";
import ModeSwitch from "./ModeSwitch";

function genId() {
  return Math.random().toString(36).slice(2);
}

const toolBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8,
  background: "var(--bg-card)", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "var(--text-muted)", cursor: "pointer", padding: 0, flexShrink: 0,
};

export default function InputBox() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showLink, setShowLink] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addAttachment(a: Attachment) {
    setAttachments((prev) => [...prev, a]);
  }
  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSubmit() {
    if (!content.trim() && attachments.length === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setContent("");
    setAttachments([]);
    setSubmitting(false);
  }

  async function handleClipboard() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith("image/"));
        if (imgType) {
          const blob = await item.getType(imgType);
          addAttachment({
            id: genId(), type: "image",
            name: `Clipboard.${imgType.split("/")[1]}`,
            preview: URL.createObjectURL(blob),
          });
          return;
        }
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          setContent((c) => c + text);
          textareaRef.current?.focus();
          return;
        }
      }
    } catch { /* clipboard denied */ }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addAttachment({
      id: genId(), type: "image",
      name: file.name,
      preview: URL.createObjectURL(file),
    });
    e.target.value = "";
  }

  function handlePaste(e: React.ClipboardEvent) {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) continue;
        addAttachment({
          id: genId(), type: "image",
          name: `Pasted.${item.type.split("/")[1]}`,
          preview: URL.createObjectURL(blob),
        });
        return;
      }
    }
  }

  function handleLinkSubmit(url: string, hostname: string) {
    addAttachment({ id: genId(), type: "link", name: hostname, preview: url, url });
    setShowLink(false);
  }

  const canSubmit = !submitting && (content.trim().length > 0 || attachments.length > 0);

  return (
    <>
      <div style={{
        background: "var(--bg-input)", border: "1px solid var(--border)",
        borderRadius: 12, display: "flex", flexDirection: "column",
      }}>
        {/* Textarea */}
        <div style={{ padding: "12px 14px 0" }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
            onPaste={handlePaste}
            placeholder="Push content to device..."
            rows={2}
            style={{
              width: "100%", background: "transparent",
              border: "none", outline: "none", resize: "none",
              fontSize: 14, lineHeight: 1.5, color: "var(--text)",
              padding: 0, margin: 0, minHeight: 48,
            }}
          />
        </div>

        {/* Attachments */}
        <AttachmentList attachments={attachments} onRemove={removeAttachment} />

        {/* Toolbar */}
        <div style={{
          padding: "8px 10px 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Left tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={toolBtn} onClick={() => fileRef.current?.click()} title="Upload image">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2.5v6M4.5 5L7 2.5 9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 11h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

            <button style={toolBtn} onClick={handleClipboard} title="Paste from clipboard">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="3.5" y="3.5" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5.5 3.5V2.5a1 1 0 0 1 3 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>

            <button style={toolBtn} onClick={() => setShowLink(true)} title="Add link">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M6 8a3 3 0 0 0 4.24 0l1.42-1.42a3 3 0 0 0-4.24-4.24L7 2.76" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M8 6a3 3 0 0 0-4.24 0L2.34 7.42a3 3 0 0 0 4.24 4.24L7 11.24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Right: mode + submit */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ModeSwitch mode={mode} deviceId={deviceId} onModeChange={setMode} onDeviceChange={setDeviceId} />

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: "var(--accent)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--bg)", cursor: canSubmit ? "pointer" : "default",
                opacity: canSubmit ? 1 : 0.25,
                transition: "opacity 150ms", flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 11V2M3.5 5L6.5 2l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showLink && <LinkModal onClose={() => setShowLink(false)} onSubmit={handleLinkSubmit} />}
    </>
  );
}
