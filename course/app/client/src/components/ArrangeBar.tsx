// Exercise 11.3: ArrangeBar. Read curriculum/part-11/b-move-and-resize.md first.
import { Todo } from "@app/client/src/components/Todo";

export interface ArrangeBarProps {
  parts: readonly { id: string; name: string }[];   // the things in the room right now
  selected: string;                                 // the id of the one being moved
  scale: number;                                    // its size: 1 is 100%
  onSelect: (partId: string) => void;
  onMove: (dx: number, dy: number) => void;         // in scene units
  onResize: (ds: number) => void;
  onReset: () => void;
  onDone: () => void;
}
export const STEP = 20;         // one press of an arrow, in scene units
export const SIZE_STEP = 0.1;   // one press of − or +

/**
 * <div role="toolbar" aria-label="Arrange the room" className="arrange-bar"> with:
 * - a <select> labelled "Item" with one <option value={id}> per part, showing `selected`; changing it calls onSelect(id)
 * - <span role="group" aria-label="Move"> with four buttons named "Move left", "Move up", "Move down", "Move right"
 *   (showing ← ↑ ↓ →), calling onMove(-STEP, 0), onMove(0, -STEP), onMove(0, STEP), onMove(STEP, 0)
 * - <span role="group" aria-label="Size"> with a button "Smaller" (−) calling onResize(-SIZE_STEP), the size as a
 *   whole percentage ("120%") in an element with aria-live="polite", and a button "Bigger" (+) calling onResize(SIZE_STEP)
 * - buttons "Put everything back" (onReset) and "Done" (onDone)
 * Every button has type="button". This toolbar is the way to arrange the room without dragging.
 */
export function ArrangeBar(props: ArrangeBarProps) {
  // TODO 11.3
  return <Todo exercise="11.3" what="The controls for arranging the room" />;
}
