# Part 10a: A room from data

*[Part 10: Build your own room](README.md) · section a*

The scenes from Part 8 are each one long SVG string. To change the sofa you'd edit the drawing. A **builder** needs the opposite: a room described as *data*, and a function that draws whatever the data says.

## Slots and choices

A room has **slots** (wall, floor, window, view, furniture, wall shelf, light, plant, drink, board), and each slot has a few **options**. A room is one option per slot:

```ts
const room = { wall: "sage", floor: "rug", window: "arched", view: "garden", seat: "armchair",
               shelf: "floating", light: "floor", plant: "monstera", drink: "tea", board: "cork" };
```

Ten short strings. That is the whole room: small enough to save, sync, share in a message, or generate at random. The drawings live in `art/room.ts` (given): every option carries a fragment of SVG, and `buildRoom(room)` stacks the fragments back to front, the way you'd paint it: wall, floor, window, things on the wall, furniture, light, drink, plant.

10 slots with 46 options give 46 small drawings, and 8 × 4 × 5 × 5 × 4 × 4 × 4 × 5 × 4 × 3 = **3,072,000 combinations**. That's the pay-off of composition: you draw parts, you get combinations.

The parts that react to your work (9c) come along for free. Any plant has `.leaf` paths, so any plant droops; any drink has `.drink`, so any cup empties; every day-time view has a `.sky`.

## Never trust what was saved

The room is saved in the browser. When you read it back you can't know what you'll get: nothing (first visit), a room from an older version with a slot missing, an option you've since removed, or something edited by hand. TypeScript can't help: the data comes from outside the program, so its honest type is `unknown` (Part 1d).

`normalizeRoom(slots, defaults, saved)` is the gate. Whatever comes in, a complete valid room comes out:

- go through the **slots**, not through the saved keys. That way missing slots get filled and extra keys are dropped without any special code;
- keep a saved choice only if it's a string **and** one of that slot's option ids; otherwise take the default.

```ts
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
```

That `v is ...` return type is a **type guard**: after `if (isRecord(saved))`, TypeScript lets you read `saved[slot.id]`. Each value is still `unknown`, so you check it too. The rest of the app can then rely on `Room` being right. Validate once at the edge, trust inside.

`setSlot` builds on it: normalize, then change one choice if (and only if) that slot has that option. It returns a new object and never changes the one it was given, as every update since Part 1c.

## Randomness you can test

*Surprise me* picks a random option per slot:

```ts
slot.options[Math.floor(random() * slot.options.length)]
```

`Math.random()` returns a number from 0 up to but not including 1, so `Math.floor(random() * n)` is a whole number from 0 to n − 1: a valid index, each equally likely.

A function that calls `Math.random()` directly gives a different answer every time, so a test can only check that the result is *valid*, not that it's *right*. So `random` is a **parameter** with `Math.random` as its default. The app calls `randomRoom(slots)`; a test passes a function that returns 0, then 0.5, then 0.99 and knows exactly which room must come out. It's the same move as passing `today` (Part 2) and `hour` (9c): anything that changes from call to call comes in from outside.

## Generic on purpose

Notice the signatures: these three functions take `slots` and `defaults` as arguments, and know nothing about walls or plants. The tests use a made-up room with three slots. Because the rules don't mention any particular slot, adding a slot or an option later needs no change to them, and none to their tests.

## Read more
- Narrowing and type predicates (TypeScript handbook): <https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates>
- `Math.random` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random>
- `Record<Keys, Type>` (TypeScript handbook): <https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type>

---

## Exercise 10.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 10.1: The rules of a room

**Edit:** `app/shared/room-choices.ts` · **Tests:** `tests/part-10/10.1-room-choices.test.ts` · **Run:** `npm run ex 10.1`

Write `normalizeRoom(slots, defaults, saved)`: one valid choice per slot in slot order, from anything at all. Then `setSlot`: a new room with one choice changed, ignoring unknown slots and options. Then `randomRoom(slots, random)`: the option at `floor(random() × options)` for each slot.

---

[← Part 9c A room that reacts](../part-9/c-a-room-that-reacts.md) · [10b The room builder →](b-the-room-builder.md)
