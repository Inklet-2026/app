import type { Attachment } from "../types";

interface Props {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentList({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div style={{
      display: "flex", gap: 6, flexWrap: "wrap",
      padding: "6px 14px 0",
    }}>
      {attachments.map((a) => (
        <div key={a.id} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "3px 6px 3px 8px",
          fontSize: 11, color: "var(--text-secondary)",
          maxWidth: 160,
        }}>
          <span>{a.type === "link" ? "🔗" : a.type === "image" ? "🖼" : "📋"}</span>
          <span style={{
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const, flex: 1,
          }}>
            {a.name}
          </span>
          <button
            onClick={() => onRemove(a.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 12, padding: "0 2px",
              lineHeight: 1, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
