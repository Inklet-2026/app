import type { Attachment } from "../types";

function attachmentIcon(type: Attachment["type"]) {
  if (type === "image") return "🖼";
  if (type === "link") return "🔗";
  return "📋";
}

interface Props {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentList({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "6px 12px 0",
      }}
    >
      {attachments.map((a) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "4px 6px 4px 8px",
            fontSize: 12,
            color: "var(--text-secondary)",
            maxWidth: 160,
          }}
        >
          <span style={{ flexShrink: 0 }}>{attachmentIcon(a.type)}</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {a.name}
          </span>
          <button
            onClick={() => onRemove(a.id)}
            style={{
              background: "none",
              border: "none",
              padding: "0 0 0 2px",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: 12,
              lineHeight: 1,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
            aria-label={`Remove ${a.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
