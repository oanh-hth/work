import type { CSSProperties } from "react";
import type { BoardNotes, BoardSpot } from "@app/shared/board";

const TILTS = [-3, 2, -1];

export function WallBoard({ notes, look, onOpen }: { notes: BoardNotes; look: BoardSpot["look"]; onOpen: () => void }) {
  const { open, overdue, doneToday, next } = notes;
  return (
    <button type="button" className="board" data-look={look} onClick={onOpen}
      aria-label={`Open Whybook: ${open} to do, ${doneToday} done today`}>
      <span className="board-body">
        <span className="b-title">Today</span>
        <span className="b-stats"><b>{open}</b> to do{overdue > 0 && <> · <b className="b-warn">{overdue}</b> overdue</>} · <b>{doneToday}</b> done</span>
        <span className="b-notes">
          {next.length
            ? next.map((t, i) => (
                <span key={t.id} className="b-note" style={{ "--r": `${TILTS[i]}deg` } as CSSProperties}>
                  {t.complexity === "complex" ? "◆ " : ""}{t.title}
                </span>))
            : <span className="b-note">All clear ✓</span>}
        </span>
        <span className="b-open">Tap to open</span>
      </span>
    </button>
  );
}
