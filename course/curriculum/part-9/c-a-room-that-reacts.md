# Part 9c: A room that reacts

*[Part 9: An app that works with you](README.md) · section c*

Until now the room is wallpaper: the same animation whatever you do. In this last section it reflects your day:

- the **light** follows the clock: a warm morning, a plain day, an orange evening, a dark night, with the sky in the windows to match;
- the **coffee cups empty** as you finish today's tasks, and the steam fades with them;
- the **plants** stand tall while nothing is overdue, and droop, their leaves falling outward and losing colour, when something is.

None of this is a notification. It's information in the corner of your eye, which is the reason to have a room at all.

## Three facts, derived

Everything above comes from three values, computed from the tasks and the clock by one pure function:

```ts
roomState(tasks, today, hour)  // → { time: "evening", left: 0.25, mood: "calm" }
```

- `time` from the hour: night before 6, morning before 11, day before 17, evening before 21, then night.
- `left`, the share of today's work still open: `open / (open + doneToday)`. With no work at all it's 1: a fresh, full cup. Mind the division by zero.
- `mood`: "alert" when `overdue > 0`.

`hour` is a **parameter**, not `new Date().getHours()` inside the function. A function that reads the clock gives a different answer every time you call it and can't be tested; one that receives the hour is pure. The shell reads the clock (and re-reads it every five minutes) and passes it in. You've seen this before: `today` has been a parameter since Part 2.

## Data drives the drawing, through CSS

The scene is a big SVG string, set once with `dangerouslySetInnerHTML` (8a). Rebuilding it for every change would restart its animations. Instead the shell writes the three facts where CSS can read them, on `<html>`:

```ts
html.dataset.time = r.time;                          // <html data-time="evening">
html.dataset.mood = r.mood;                          // <html data-mood="alert">
html.style.setProperty("--left", r.left.toFixed(2)); // <html style="--left: 0.25">
```

and the stylesheet does the rest. The parts of the drawings that react have class names:

```css
html[data-time="night"] .backdrop .sky { fill: #27325A }           /* the window's sky */
html[data-mood="alert"] .backdrop .leaf.l { transform: rotate(-30deg) }   /* a plant's left leaves droop */
.backdrop .drink { transform: scale(var(--left, 1)); transition: transform 1.2s }   /* the coffee */
.backdrop .steam { opacity: var(--left, 1) }
```

Three techniques, each for a different kind of value:

- a **data attribute** for one of a few named states (`time`, `mood`), matched with an attribute selector;
- a **CSS variable** for a number (`--left`), used in `calc()`, `scale()` or `opacity`; CSS variables inherit, so setting it on `<html>` reaches inside the SVG;
- a **transition**, so the cup drains and the leaves sink instead of jumping, switched off under `prefers-reduced-motion`.

One SVG detail: each leaf must turn around its **base**, not its middle. Every leaf path carries its own `transform-origin` (the point where it meets the pot), so one CSS rule can droop every plant in every scene.

React never touches the SVG again. This is "derive, don't store" one level further: the picture is derived from state by the browser's own engine.

## Is writing to `<html>` allowed in React?

Yes, in an effect. `document.documentElement` is outside React's tree, like the document title or browser focus, and `useEffect` exists to synchronise such things with state. The shell's `useRoomState` hook does exactly that, with `[state.tasks, hour]` as dependencies.

## You've finished

The app now captures tasks quickly, keeps what you decided and why, hands it back when you need it, and is a place you like opening. Every part of it is yours: the types, the reducer, the components, the server, the drawings. From here, change it. Some ideas, roughly from small to large:

- mark a decision as replaced by a newer one;
- file a decision under more than one category;
- a weekly review page;
- a bookshelf in the library scene where each book is a folder;
- handwriting on the board with the Apple Pencil.

## Read more
- Using data attributes (MDN): <https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes>
- Using CSS custom properties (MDN): <https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties>
- Synchronizing with effects (React): <https://react.dev/learn/synchronizing-with-effects>
- Keeping components pure (React): <https://react.dev/learn/keeping-components-pure>

---

## Exercise 9.4

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.4: The room reflects your work

**Edit:** `app/shared/room.ts` · **Tests:** `tests/part-9/9.4-room.test.ts` · **Run:** `npm run ex 9.4`

Write `timeOfDay(hour)` and `roomState(tasks, today, hour)`: the part of the day, the share of today's work still open (1 when there is none), and "alert" when something is overdue. Then, in the coffee shop, tick off your tasks and watch the cups; then give a task a due date in the past and look at the plant.

---

[← 9b Add from the board](b-add-from-the-board.md) · [Back to the course overview →](../../README.md)
