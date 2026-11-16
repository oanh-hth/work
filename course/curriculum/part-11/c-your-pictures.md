# Part 11c: Your pictures

*[Part 11: Make it yours](README.md) · section c*

Now something no list could offer: a photo of your own as a poster, as the view from the window or as the whole background, and a poster you draw yourself with a finger or the Apple Pencil.

## A picture as text: data URLs

To save a picture next to the rest of the room it has to become a string. A **data URL** is a whole file written out as text:

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ…
```

An `<img src>` or an SVG `<image href>` accepts it like any address. No upload, no server, no second request: the picture is *in* the data. The price is size: base64 text is a third bigger than the file.

`isImageData` checks that a saved value starts with `data:image/`. That refuses `https://…` addresses, which would make your room load something from someone else's server every time you open the app.

## Shrink first

A phone photo is 12 megapixels and several megabytes. The poster in the room is 154 units wide. Saving the original would fill the browser's storage (a few megabytes in total), slow every redraw, and blow through any sync limit. So the picture is made small **before** it is saved:

```ts
fitInside(4000, 3000, 1400)  // { width: 1400, height: 1050 }
```

Same shape, longer side at most `max`, never enlarged. The given `shrinkImage` then does the pixel work with a `<canvas>`: `createImageBitmap(file)` decodes the file, `drawImage` paints it at the new size, and `toDataURL("image/jpeg", 0.82)` writes it out. A 5 MB photo becomes about 100 KB. You write the arithmetic, which is the part that can be wrong in interesting ways (portrait or landscape, tiny pictures, rounding to zero).

## A drawing is a list of strokes

The obvious way to build a drawing pad: on every pointer move, draw a bit of line on the canvas. It works until someone presses *Undo*. The canvas is only pixels; it has no idea what a "stroke" was.

So keep the **drawing as data**, and treat the canvas as a picture of that data:

```ts
strokes = [ { color: "#E4572E", size: 6, points: [[40, 60, 0.5], [50, 72, 0.7], …] }, … ]
```

A reducer (Part 2b again) handles `start`, `move`, `end`, `undo`, `clear`, `ink` and `size`. Undo is `strokes.slice(0, -1)`. Clear is `[]`. The given `DrawingPad` repaints the whole canvas from the data whenever it changes. That sounds wasteful and isn't: a few hundred short lines take well under a millisecond.

The third number in each point is **pressure**. A mouse or finger reports nothing useful, so it counts as 0.5; the Apple Pencil reports 0 to 1. `strokeWidth(size, pressure)` turns it into a line width, and the pad draws each little segment at its own width. That's all a pressure-sensitive pen is.

Two more things the pad does that are easy to miss:

- **`setPointerCapture`**: once the pen is down, the canvas keeps receiving its events even if it slips outside, so a stroke doesn't break at the edge;
- **`getCoalescedEvents`**: the browser merges fast pointer moves into one event per frame. Asking for the merged ones gives every sample the Pencil took, and smooth curves instead of corners.

## Where is "fixed" fixed to? Portals

The pad covers the screen with `position: fixed; inset: 0`. Opened from Settings, it at first appeared *inside* the panel and partly off screen on a phone. The reason is a rule worth knowing: an element with `transform`, `filter` or **`backdrop-filter`** becomes the containing block for fixed descendants. The see-through panel has `backdrop-filter`, so "fixed" meant "fixed to the panel".

The fix is `createPortal(…, document.body)`: the pad stays where it is in the React tree (it still gets props and state from Settings) but its DOM is placed at the top of the page, outside the panel. The same was done for the outcome form on the Tasks page. Use a portal for anything that must sit above the page: dialogs, menus, tooltips.

## Read more
- Data URLs (MDN): <https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/data>
- `CanvasRenderingContext2D.drawImage` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage>
- `PointerEvent.pressure` and `getCoalescedEvents` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent>
- `createPortal` (React): <https://react.dev/reference/react-dom/createPortal>
- Containing block (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block>

---

## Exercises 11.4–11.5

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 11.4: Your pictures

**Edit:** `app/shared/pictures.ts` · **Tests:** `tests/part-11/11.4-pictures.test.ts` · **Run:** `npm run ex 11.4`

Write `fitInside(width, height, max)`, `isImageData`, `setImage(images, kind, data)` and `normalizeImages(saved, kinds)`. Then add a photo as a poster, as the window's view and as the whole background.

### 11.5: A drawing as data

**Edit:** `app/shared/strokes.ts` · **Tests:** `tests/part-11/11.5-strokes.test.ts` · **Run:** `npm run ex 11.5`

Write `strokeWidth(size, pressure)` and `padReducer`: start, move (only while drawing), end, undo, clear, and ink and size for the next stroke, never changing the state it was given. Then press **Draw**, make a poster, undo a stroke, and hang it on the wall.

---

[← 11b Move and resize](b-move-and-resize.md) · [11d A collection to earn →](d-a-collection.md)
