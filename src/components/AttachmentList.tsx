import type { Attachment } from "../types";

interface Props {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export default function AttachmentList({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div style={{
      display: "flex", gap: 8,
      padding: "8px 14px 0",
      overflowX: "auto", overflowY: "hidden",
      flexWrap: "nowrap",
      scrollbarWidth: "none",
    }}>
      {attachments.map((a) => (
        <div key={a.id} style={{
          flexShrink: 0,
          width: 100, height: 72,
          borderRadius: 8,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          overflow: "hidden",
          position: "relative",
          display: "flex", flexDirection: "column",
        }}>
          {/* Preview area */}
          {a.type === "image" && a.preview ? (
            <div style={{
              flex: 1, overflow: "hidden",
              backgroundImage: `url(${a.preview})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
          ) : a.type === "link" ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "6px 8px", gap: 2,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4 }}>
                <path d="M6.7 9.3a3.5 3.5 0 005 0l1.6-1.6a3.5 3.5 0 00-5-5L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M9.3 6.7a3.5 3.5 0 00-5 0L2.7 8.3a3.5 3.5 0 005 5L8 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontSize: 10, color: "var(--text-secondary)",
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const, width: "100%", textAlign: "center",
              }}>
                {a.name}
              </span>
            </div>
          ) : (
            <div style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 20, opacity: 0.3,
            }}>
              📋
            </div>
          )}

          {/* Name bar */}
          <div style={{
            padding: "3px 6px",
            fontSize: 9, color: "var(--text-muted)",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
            borderTop: "1px solid var(--border)",
            background: "var(--bg-card)",
          }}>
            {a.name}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(a.id)}
            style={{
              position: "absolute", top: 3, right: 3,
              width: 16, height: 16, borderRadius: "50%",
              background: "rgba(0,0,0,0.4)", border: "none",
              color: "white", fontSize: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, padding: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
