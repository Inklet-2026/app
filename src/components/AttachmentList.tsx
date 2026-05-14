import { useState, useEffect, useRef } from "react";
import type { Attachment } from "../types";

interface Props {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

const CARD_HEIGHT = 72;

function AnimatedCard({ children, onRemove, isNew }: { children: React.ReactNode; onRemove: () => void; isNew: boolean }) {
  const [state, setState] = useState<"entering" | "visible" | "exiting">(isNew ? "entering" : "visible");
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (state === "entering") {
      requestAnimationFrame(() => setState("visible"));
    }
  }, [state]);

  function handleRemove() {
    if (cardRef.current) setCardWidth(cardRef.current.offsetWidth);
    setState("exiting");
    setTimeout(onRemove, 200);
  }

  return (
    <div
      ref={cardRef}
      style={{
        opacity: state === "exiting" ? 0 : state === "entering" ? 0 : 1,
        transform: state === "entering" ? "scale(0.95)" : state === "exiting" ? "scale(0.95)" : "scale(1)",
        width: state === "exiting" ? 0 : cardWidth ?? undefined,
        marginRight: state === "exiting" ? -8 : 0,
        transition: "opacity 150ms ease, transform 150ms ease, width 200ms ease, margin 200ms ease",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {typeof children === "function" ? (children as any)(handleRemove) : children}
    </div>
  );
}

function ImageCard({ a, onAnimatedRemove }: { a: Attachment; onAnimatedRemove: () => void }) {
  return (
    <div style={{
      width: CARD_HEIGHT, height: CARD_HEIGHT,
      borderRadius: 12, overflow: "hidden", position: "relative",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        flex: 1, overflow: "hidden",
        backgroundImage: `url(${a.preview})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      <div style={{
        padding: "3px 6px", fontSize: 9, color: "var(--text-muted)",
        overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
        borderTop: "1px solid var(--border)",
      }}>
        {a.name}
      </div>
      <RemoveBtn onClick={onAnimatedRemove} />
    </div>
  );
}

function LinkCard({ a, onAnimatedRemove }: { a: Attachment; onAnimatedRemove: () => void }) {
  const og = a.og;
  return (
    <div style={{
      height: CARD_HEIGHT,
      borderRadius: 12, overflow: "hidden", position: "relative",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      display: "flex", width: 220,
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
        flex: 1, padding: "6px 8px", minWidth: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 1,
        overflow: "hidden",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: "var(--text)",
          overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}>
          {og?.title || a.name}
        </div>
        {og?.description && (
          <div style={{
            fontSize: 9, color: "var(--text-muted)", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}>
            {og.description}
          </div>
        )}
        <div style={{ fontSize: 9, color: "var(--text-muted)", opacity: 0.6 }}>
          {og?.hostname || a.name}
        </div>
      </div>
      <RemoveBtn onClick={onAnimatedRemove} />
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
  const knownIds = useRef(new Set<string>());

  if (attachments.length === 0) {
    knownIds.current.clear();
    return null;
  }

  const currentIds = new Set(attachments.map((a) => a.id));
  const newIds = new Set<string>();
  for (const id of currentIds) {
    if (!knownIds.current.has(id)) newIds.add(id);
  }
  knownIds.current = currentIds;

  return (
    <div style={{
      display: "flex", gap: 8,
      padding: 0,
      overflowX: "auto", overflowY: "hidden",
      flexWrap: "nowrap", scrollbarWidth: "thin",
      scrollbarColor: "var(--border) transparent",
    }}>
      {attachments.map((a) => (
        <AnimatedCard key={a.id} isNew={newIds.has(a.id)} onRemove={() => onRemove(a.id)}>
          {(handleRemove: () => void) =>
            a.type === "link" ? (
              <LinkCard a={a} onAnimatedRemove={handleRemove} />
            ) : (
              <ImageCard a={a} onAnimatedRemove={handleRemove} />
            )
          }
        </AnimatedCard>
      ))}
    </div>
  );
}
