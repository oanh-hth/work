// Exercise 9.3: BoardQuickAdd. Read curriculum/part-9/b-add-from-the-board.md first.
import type { Complexity } from "@app/shared/types";
import { Todo } from "@app/client/src/components/Todo";

/**
 * <form className="board-form" aria-label="Add a task"> with:
 * - a text input labelled "Add a task" (a visually-hidden <label>, or aria-label), focused when the form appears
 * - a checkbox labelled "Needs a decision"
 * - a submit button "Add"
 * On submit with a title (trimmed): onAdd(title, "complex" when the box is ticked, else "simple"),
 * then empty the input, untick the box and keep the focus in the input, ready for the next task.
 * An empty title adds nothing. Escape anywhere in the form calls onClose.
 */
export function BoardQuickAdd({ onAdd, onClose }: { onAdd: (title: string, complexity: Complexity) => void; onClose: () => void }) {
  // TODO 9.3
  return <Todo exercise="9.3" what="Adding a task from the board" />;
}
