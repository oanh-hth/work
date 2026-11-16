# Part 11b: Move and resize

*[Part 11: Make it yours](README.md) · section b*

Every sofa in Part 10 stands in the same spot. Here you drag things where you want them, with a finger, a mouse or the Apple Pencil, and make them bigger or smaller.

## Position is data too

Each movable thing gets three numbers: how far it moved from where it was drawn, and its size.

```ts
pos = { plant: { x: 40, y: -10, s: 1.2 } }   // 40 right, 10 up, 120%
```

The drawing code wraps every part in a group, `<g data-part="plant" transform="…">`, and the transform comes from those numbers:

```
translate(40 -10) translate(556 640) scale(1.2) translate(-556 -640)
```

Read an SVG transform list **right to left**: move the plant's anchor (the base of its pot, at 556, 640) to the origin, scale, move it back, then shift by your offset. Scaling always happens around the origin, so without the two anchor moves a bigger plant would also slide away from its spot. This is the same trick as `transform-origin` in CSS, written out.

## From finger to scene

A drag gives you pixels on the **screen**. Positions are in **scene** units, and the scene is scaled to cover the screen (8.8): on a wide monitor one scene unit may be two pixels; on a phone, about one. So divide by the same scale that drew it:

```ts
sceneScale(viewport) = max(viewport.width / 1200, viewport.height / 800)
toScene(dx, dy, viewport) = { dx: dx / scale, dy: dy / scale }
```

Get this wrong and the plant moves faster or slower than your finger. You already wrote the forward direction in `placeBoard`; this is its inverse.

`movePart` then applies the movement with rules: whole units (no `x: 23.4000001`), two decimals for size, and limits so nothing can be dragged out of reach or shrunk to a dot. Rounding and clamping in one place means every way of moving, dragging or buttons, obeys the same rules.

## Pointer events: one API for mouse, finger and pen

`pointerdown`, `pointermove`, `pointerup` and `pointercancel` replace separate mouse and touch events. The given `useArrangeDrag` in `App.tsx` uses them like this:

- **down** on a part: remember which part, and where the pointer is;
- **move**: turn the distance since last time into scene units, `movePart`, show it;
- **up** or **cancel**: save.

Two details in it are worth reading closely.

**It counts only what was applied.** If you drag past a limit, the part stops but your finger doesn't. Subtracting the full finger movement each time would make the part "owe" you distance and jump when you come back. So after each move it advances its reference point only by what `movePart` really applied.

**While the finger is down it bypasses React.** Each move sets the `transform` attribute directly on the SVG element. Going through state would rebuild the whole scene string up to 60 times a second, and with a photo in the room that is megabytes of string work per second. So: change the DOM directly during the gesture, then save to state **once** at the end, and React and the DOM agree again. This is the right exception to "state drives the DOM": high-frequency, temporary, and reconciled when it finishes.

`touch-action: none` in the CSS tells the browser not to scroll the page while you drag.

## Dragging is never the only way

Some people can't drag: they use a keyboard, a switch, or voice control, or the thing they want is off screen on a phone. WCAG says so plainly (2.5.7, Dragging Movements): anything you can do by dragging must also be possible with single taps.

That's `ArrangeBar`: pick the item from a list, press arrows to move it, − and + to resize. It's a `role="toolbar"` with named groups, and the size is in an `aria-live="polite"` element so a screen reader says "120%" after you press +.

It calls the same `movePart`. Two ways in, one rule: you have seen this shape in 9b with `QuickCapture` and `BoardQuickAdd`.

## Read more
- Pointer events (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events>
- SVG `transform` (MDN): <https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform>
- Understanding 2.5.7 Dragging Movements (W3C): <https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements>
- ARIA: `toolbar` role (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/toolbar_role>

---

## Exercises 11.2–11.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 11.2: Move and resize

**Edit:** `app/shared/layout.ts` · **Tests:** `tests/part-11/11.2-layout.test.ts` · **Run:** `npm run ex 11.2`

Write `sceneScale`, `toScene`, `movePart` (rounded, within limits, never changing its argument), `partTransform` and `normalizePos`.

### 11.3: ArrangeBar

**Edit:** `app/client/src/components/ArrangeBar.tsx` · **Tests:** `tests/part-11/11.3-arrange-bar.test.tsx` · **Run:** `npm run ex 11.3`

Build `ArrangeBar`: a toolbar with an *Item* list, four named move buttons, *Smaller* and *Bigger* around a live percentage, *Put everything back* and *Done*. Then press **Move and resize things** in Settings: drag the plant, and move the board with the buttons only.

---

[← 11a Your colours](a-your-colours.md) · [11c Your pictures →](c-your-pictures.md)
