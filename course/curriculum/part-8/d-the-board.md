# Part 8d: The board on the wall

*[Part 8: Themes, stickers and folders](README.md) · section d*

With a scene behind it, the task panel still covers most of the room. In this section the room gets the whole screen: your tasks hang on a board on the wall (a chalkboard in the coffee shop, a corkboard in the other rooms) showing today's counts and your next three tasks. Tap the board and the full app opens; *← Back to the room* puts it back.

The hard part isn't drawing the board. It's putting it **on the wall**, in the same spot of the drawing, on every screen from a phone to a wide monitor.

## Where is the wall? Mapping scene coordinates to the screen

Every scene is drawn on a 1200 × 800 canvas (its `viewBox`) and fills the screen with `preserveAspectRatio="xMidYMid slice"`, the SVG version of CSS `object-fit: cover`:

- it scales by **the larger** of the two ratios, so it covers the whole screen: `scale = max(W / 1200, H / 800)`;
- it's centred, so whatever doesn't fit is cut off equally on both sides: `offsetX = (W - 1200 * scale) / 2` (zero or negative).

So a point `(x, y)` of the drawing lands on the screen at `(offsetX + x * scale, offsetY + y * scale)`. Each theme in `art.ts` now has a `board` spot in scene coordinates, like `{ x: 612, y: 112, w: 316, h: 246, look: "chalk" }` for the coffee shop's menu board, or `null` for *Plain*.

Try it on paper: a phone held upright, 390 × 844. `scale = max(0.325, 1.055) = 1.055`, the scene is 1266 px wide, so `offsetX = -438`: a third of the room on each side is off screen. The coffee shop board's left edge lands at `-438 + 612 × 1.055 ≈ 208`, and it's 333 px wide, which runs off the right edge. Mapping is only step one.

## Rules on top of the maths

A board that is exactly on the wall but unreadable or half off screen is no use. Three rules, applied in order:

1. **Never too small.** Under 230 px wide, grow it (keeping its proportions) **around its centre**, so it stays over the same bit of wall.
2. **Always fully on screen.** Clamp `left` between 8 and `W - width - 8`, and `top` between `header + 8` and `H - height - 8`. A clamp is one line: `Math.min(Math.max(lo, v), hi)`.
3. **Text scales with it.** `fontSize = width / 20`, kept between 11 and 16 px. Everything inside uses `em`, so one number sizes it all.

This is a pure function, `placeBoard(spot, viewport, headerHeight)`, with no DOM in it. That's why you can test it with plain numbers. The app shell measures the window and the header and passes them in, and listens for `resize` to call it again.

## What's on the board: one more query

`boardNotes(tasks, today)` reuses what you built in Part 2: `weekSummary` (2.4) for open, overdue and done today, and `sortTasks` (2.2) for the order, taking the first three open tasks. Derive, don't store: the board can't disagree with the task list, because both come from the same `state.tasks`.

## A whole board in one button

The board does one thing, opening the app, so it's **one `<button>`**: one tab stop, Enter and Space work, and screen readers announce it. Two consequences:

- **Name it by what it does and shows**: `aria-label="Open Whybook: 4 to do, 2 done today"`. Without it, a screen reader would read every note on it as one long name.
- **Only phrasing content inside.** A button may contain text and inline elements like `<span>` and `<b>`, not `<div>`, `<p>` or headings. Make the layout with `<span>`s and CSS (`display: flex` works on any element).

The look is all CSS, chosen with a data attribute: `data-look="chalk"` or `"cork"`. Paper notes on the corkboard get a pin from a `::before` circle and a tilt from a CSS variable, like the notes in 8c: `style={{ "--r": "-3deg" }}` with `transform: rotate(var(--r))`. Under `prefers-reduced-motion` the hover tilt is turned off.

## Read more
- `preserveAspectRatio` (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio>
- `object-fit` (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit>
- Content categories: phrasing content (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content>
- `Window: resize` event (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event>

---

## Exercises 8.8–8.9

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 8.8: Where the board hangs

**Edit:** `app/shared/board.ts` · **Tests:** `tests/part-8/8.8-board.test.ts` · **Run:** `npm run ex 8.8`

Write `placeBoard(spot, viewport, headerHeight)`: map the spot from scene to screen like `cover`, grow it to at least 230 px wide around its centre, keep it fully on screen under the header, and size the text. Then `boardNotes(tasks, today)`: open, overdue and done today, and the next three open tasks.

### 8.9: WallBoard

**Edit:** `app/client/src/components/WallBoard.tsx` · **Tests:** `tests/part-8/8.9-wall-board.test.tsx` · **Run:** `npm run ex 8.9`

Build `WallBoard`: one button named "Open Whybook: 4 to do, 2 done today", with a `data-look`, the title, the counts, a tilted note per next task (◆ for complex ones) or "All clear ✓", and "Tap to open". Then run `npm run dev`, pick the coffee shop, and resize the window: the board should stay on the wall.

---

[← 8c Folders and paper notes](c-folders.md) · [Part 9: An app that works with you →](../part-9/README.md)
