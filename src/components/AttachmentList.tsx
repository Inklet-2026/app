import type { Attachment } from "../types";

interface Props {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

const CARD_HEIGHT = 72;

function ImageCard({ a, onRemove }: { a: Attachment; onRemove: () => void }) {
  return (
    <div style={{
      flexShrink: 0, width: CARD_HEIGHT, height: CARD_HEIGHT,
      borderRadius: 12, overflow: "hidden", position: "relative",
      background: "var(--bg-card)", border: "1px solid var(--border)",
    }}>
      <div style={{
        width: "100%", height: "100%",
        backgroundImage: `url(${a.preview})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      <RemoveBtn onClick={onRemove} />
    </div>
  );
}

function LinkCard({ a, onRemove }: { a: Attachment; onRemove: () => void }) {
  const og = a.og;
  return (
    <div style={{
      flexShrink: 0, height: CARD_HEIGHT,
      borderRadius: 12, overflow: "hidden", position: "relative",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      display: "flex", maxWidth: 320,
    }}>
      {og?.image && (
        <div style={{
          width: CARD_HEIGHT, height: CARD_HEIGHT, flexShrink: 0,
          backgroundImage: `url(${og.image})`,
          backgroundSize: "cover", backgroundPosition: "center",
          borderRight: "1px solid var(--border)",
        }} />
      )}
      <div style={{
        flex: 1, padding: "8px 10px", minWidth: 120,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 2,
        overflow: "hidden",
      }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: "var(--text)",
          overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}>
          {og?.title || a.name}
        </div>
        {og?.description && (
          <div style={{
            fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}>
            {og.description}
          </div>
        )}
        <div style={{
          fontSize: 10, color: "var(--text-muted)", opacity: 0.7,
          overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}>
          {og?.hostname || a.name}
        </div>
      </div>
      <RemoveBtn onClick={onRemove} />
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: "absolute", top: 4, right: 4,
      width: 16, height: 16, borderRadius: "50%",
      background: "rgba(0,0,0,0.35)", border: "none",
      color: "white", fontSize: 10, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      lineHeight: 1, padding: 0,
    }}>×</button>
  );
}

export default function AttachmentList({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div style={{
      display: "flex", gap: 8,
      padding: 0,
      overflowX: "auto", overflowY: "hidden",
      flexWrap: "nowrap", scrollbarWidth: "none",
    }}>
      {attachments.map((a) =>
        a.type === "link" ? (
          <LinkCard key={a.id} a={a} onRemove={() => onRemove(a.id)} />
        ) : (
          <ImageCard key={a.id} a={a} onRemove={() => onRemove(a.id)} />
        )
      )}
    </div>
  );
}
