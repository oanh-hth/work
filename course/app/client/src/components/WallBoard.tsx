// Exercise 8.9: WallBoard. Read curriculum/part-8/d-the-board.md first.
import type { BoardNotes } from "@app/shared/board";
import { Todo } from "@app/client/src/components/Todo";

/**
 * One <button type="button" className="board" data-look={look}> that fills the spot the app shell gives it, and calls onOpen.
 * - aria-label: "Open Whybook: <open> to do, <doneToday> done today"
 * - inside, a <span className="board-body"> with:
 *   - <span className="b-title">Today</span>
 *   - <span className="b-stats">: "<open> to do · <doneToday> done", with " · <overdue> overdue" after "to do" only when overdue > 0
 *   - <span className="b-notes"> with one <span className="b-note"> per task in notes.next, its title,
 *     starting with "◆ " for complex tasks, tilted with style={{ "--r": `${[-3, 2, -1][i]}deg` }};
 *     or one note "All clear ✓" when there's nothing next
 *   - <span className="b-open">Tap to open</span>
 * Only <span>s inside: a <button> may hold phrasing content only, no <div>, <p> or <h2>.
 */
export function WallBoard({ notes, look, onOpen }: { notes: BoardNotes; look: "chalk" | "cork"; onOpen: () => void }) {
  // TODO 8.9
  return <Todo exercise="8.9" what="The board on the wall" />;
}
