# Part 10b: The room builder

*[Part 10: Build your own room](README.md) · section b*

The data and the rules exist. Now the screen where you choose: one row of choices per slot, and the room changing behind it as you tap.

## One component, any slots

`RoomBuilder` receives `slots` and `room` and renders two nested lists: for each slot a heading and a row of options. It doesn't know what a wall is. It knows a slot has a name and options, and an option has a name and maybe a colour. Add an eleventh slot to `art/room.ts` and it appears in the builder with no change here. That's the same idea as 10.1, on the UI side: **the data describes the form**.

```tsx
{slots.map(slot => (
  <div key={slot.id}>
    <h3 id={headingId}>{slot.name}</h3>
    <div role="radiogroup" aria-labelledby={headingId}>
      {slot.options.map(option => ( /* one choice */ ))}
    </div>
  </div>
))}
```

## One of many: a radio group

Each row is a "choose exactly one" control. Native radio inputs do that; here the choices are pill-shaped buttons, so you give the buttons the same meaning with ARIA, as in 8.1:

- the row has `role="radiogroup"` and is **named by its heading** with `aria-labelledby`, so a screen reader says "Wall, radio group";
- each choice is a `<button type="button" role="radio">` with `aria-checked="true"` or `"false"`. Write the attribute for both states: a missing `aria-checked` is not the same as false.

Ten groups need ten heading ids that don't clash with anything else on the page. `useId()` gives you one unique string per component; add the slot id to it: `` `${base}-${slot.id}` ``.

`type="button"` matters. Inside a `<form>`, a button without a type is a submit button, and tapping "Cactus" would submit whatever form the builder happens to sit in.

Wall and floor options have a `color`, so they show a small swatch before the name. The swatch is decoration: the name already says "Sage", so the colour is never the only way to tell choices apart.

## State stays above

The builder owns no state. It calls `onChange(slotId, optionId)`, and the Settings page (given) answers with `setSlot` from 10.1 and saves the result. The shell keeps the room in `useLocalStorage` (4.1), runs it through `normalizeRoom` on the way in, and shares it through a small React context, `RoomContext`, so the backdrop and the thumbnail in your `ThemePicker` (8.1) can draw it without `ThemePicker` changing at all.

Follow one tap: button → `onChange` → `setSlot` → `setRoom` → localStorage and state → context → `Backdrop` calls `buildRoom` → the wall behind the panel changes colour. One direction, top to bottom, like everything since Part 4.

> **Take it further:** the room is saved on this device only. To sync it between your devices like your tasks, move it into `AppState`: a `setRoom` action in a small reducer chained in `rootReducer` (as you did for stickers in 8.3), and a `room` field that `withDefaults` fills in with `normalizeRoom`.

## Your own option

This is the part you asked the builder for: something in the room that *you* drew. Open `art/room.ts`. An option is an object in its slot's list:

```ts
{ id: "palm", name: "Palm", svg: plant(
    leaf("l", "M0 0C-60 -40 -110 -60 -130 -40C-90 -70 -40 -60 0 0Z", "#4E9A60") +
    leaf("r", "M0 0C60 -40 110 -60 130 -40C90 -70 40 -60 0 0Z", "#4E9A60") +
    leaf("c", "M0 0C-10 -80 -6 -140 0 -190C6 -140 10 -80 0 0Z", "#3F7D4E")) },
```

Things to know while drawing:

- everything is in the scene's 1200 × 800 space; the floor starts at y = 600. Helpers like `plant(...)` and `drink(...)` already put you in the right spot, with (0, 0) at the top of the pot or cup;
- a path's `d` is a list of commands: `M` move, `L` line, `C` curve with two control points, `Q` curve with one, `Z` close. Draw it first in a vector tool, or on paper with coordinates;
- to make a plant react, build it from `leaf("l" | "r" | "c", d, fill)`: left leaves droop left, right leaves right, the centre one sinks. Each leaf starts at (0, 0), which is the point it turns around;
- a drink reacts if its liquid has `class="drink"`, a view follows the clock if its sky has `class="sky"`.

Then look at what you did **not** have to change: `room-choices.ts`, `RoomBuilder`, the Settings page, the tests. The new option shows up as a chip, can be saved, and comes up in *Surprise me*.

## Read more
- ARIA: `radiogroup` role (MDN): <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role>
- `useId` (React): <https://react.dev/reference/react/useId>
- SVG paths (MDN tutorial): <https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths>
- Passing data deeply with context (React): <https://react.dev/learn/passing-data-deeply-with-context>

---

## Exercises 10.2–10.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 10.2: RoomBuilder

**Edit:** `app/client/src/components/RoomBuilder.tsx` · **Tests:** `tests/part-10/10.2-room-builder.test.tsx` · **Run:** `npm run ex 10.2`

Build `RoomBuilder`: a section named "Build your room" with, per slot, a heading and a radio group named by it; each option a `type="button"` radio with `aria-checked`, a colour swatch when it has a colour, calling `onChange(slotId, optionId)`; plus *Surprise me* and *Start again*. Then choose **My room** in Settings and build one.

### 10.3: Draw your own option

**Edit:** `app/client/src/art/room.ts` · no tests

- [ ] **10.3** Add one option of your own to any slot: a plant, a drink, a view, something for the wall. Give it an id and a name, draw it, and make it react if it's a plant, a drink or a sky. Check it in the builder, in *Surprise me*, on a phone-sized window, and with *Reduce Motion* on. When it's in your room, tick this box.

---

[← 10a A room from data](a-a-room-from-data.md) · [Part 11: Make it yours →](../part-11/README.md)
