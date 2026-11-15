# Part 9b: Add from the board

*[Part 9: An app that works with you](README.md) · section b*

The room from Part 8 looks good and costs something: to write down a task you now tap the board, wait for the panel, then type. Capturing a thought should be the fastest thing in the app. So the board gets a **+**: tap it, type, Enter. The room stays.

## A button can't live inside a button

The whole board is one `<button>` (8.9). Putting a "+" button inside it is invalid HTML, and browsers disagree about what a click on it means. The fix is in the structure, not in an event handler: the + is a **sibling** of the board, and CSS places it on the board's corner.

```tsx
<div className="board-spot" style={rect}>       {/* positioned by placeBoard (8.8) */}
  <WallBoard ... />
  <button className="board-add" aria-expanded={adding} aria-label="Add a task">+</button>
  {adding && <BoardQuickAdd ... />}
</div>
```

`aria-expanded` tells assistive technology that this button opens and closes something, and which state it's in. The label changes with it ("Add a task" / "Close add a task"), because a "×" read aloud means nothing.

## Focus is part of the design

A quick-add form is only quick if your hands never leave the keyboard:

- **When it opens, focus the input.** `useEffect(() => { input.current?.focus() }, [])` with a `useRef`. This is one of the legitimate uses of an effect: synchronising with something outside React (the browser's focus).
- **After adding, stay in the input**, emptied, ready for the next task. Clicking *Add* with a mouse moves focus to the button, so put it back in the submit handler.
- **Escape closes.** One `onKeyDown` on the form catches it from the input and the checkbox alike, because keyboard events bubble.

The form itself is the controlled-inputs pattern from Part 3: `title` and `complex` in state, `onSubmit` with `preventDefault`, trim, ignore an empty title.

## Lifting the action up

`BoardQuickAdd` doesn't know about the reducer. It calls `onAdd(title, complexity)` and the shell dispatches the same `add` action that `QuickCapture` (3.2) uses on the Tasks page. Two ways in, one action, one place where a task is created. The board's notes update on their own, because they're derived from `state.tasks` (8.8).

## Read more
- `aria-expanded` (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded>
- Manipulating the DOM with refs: focusing (React): <https://react.dev/learn/manipulating-the-dom-with-refs>
- Interactive content inside `<button>` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#technical_summary>

---

## Exercise 9.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.3: BoardQuickAdd

**Edit:** `app/client/src/components/BoardQuickAdd.tsx` · **Tests:** `tests/part-9/9.3-board-quick-add.test.tsx` · **Run:** `npm run ex 9.3`

Build `BoardQuickAdd`: a form named "Add a task" with a focused input, a "Needs a decision" checkbox and *Add*. Submitting a trimmed title calls `onAdd`, empties the form and keeps the focus in the input; an empty title adds nothing; Escape calls `onClose`. Then, in a room, tap +, add two tasks with Enter and watch them appear on the board.

---

[← 9a Earlier decisions](a-earlier-decisions.md) · [9c A room that reacts →](c-a-room-that-reacts.md)
