# Part 11d: A collection to earn

*[Part 11: Make it yours](README.md) · section d*

The first sketch of this app had rewards: finish work, get something. Here is that idea in its final form. Eight extra items for the room open as you record decisions: a bonsai after your first, bubble tea after five, a neon sign after ten, up to checker tiles after fifty.

## Derive, don't store (one last time)

The tempting design is a list in state: `unlocked: ["bonsai", "bubble"]`, with code that adds to it when you reach a number. Then you must answer: what if a decision is deleted? What if the list is restored from an old backup? What if you add a new reward later, for a number people have already passed? Each needs code, and each can leave the list wrong.

There is nothing to store. What is unlocked is a **function of one number**, the count of your decisions:

```ts
isUnlocked(option, decisions) = (option.unlock ?? 0) <= decisions
```

Options carry their own price (`unlock: 10`) in `art/room.ts`. Count the decisions (`decisionsOf(state.tasks).length`, from 2.3), and everything else follows: what's earned, what's next, what the builder may offer. Delete a decision and the count drops; add a reward and everyone past its number has it at once. No migration, no way to be inconsistent.

## Earned, next, fresh

`collection(rewards, decisions, before)` answers three questions for the screen:

- **earned**: every reward at or below your count;
- **next**: the first one above it, for "Next: Neon sign at 10 decisions, 3 to go". With the rewards sorted by price, that's `find`;
- **fresh**: what opened between the count *before* your latest decision and now. That's what to announce. Comparing two counts is the whole trick: no "has this been announced" flag to store. When 10 is reached from 9, the neon sign is fresh; from 10 to 11, nothing is.

`rewardsOf(slots)` collects the earned options from all slots with `flatMap` and sorts them by price. Two rewards can cost the same, and the sort is stable (9a), so they stay in slot order.

## Filtering the slots

`openSlots(slots, decisions)` returns the same slots with only the open options. The Settings page passes *that* to your `RoomBuilder` (10.2) and to `randomRoom` (10.1). Neither of them changed, and neither knows that locks exist. The builder shows what it is given; *Surprise me* picks from what it is given.

Its type is worth a look:

```ts
function openSlots<O extends Earnable, S extends EarnSlot<O>>(slots: readonly S[], decisions: number): S[]
```

The generics say: whatever richer kind of slot you pass in (with drawings, colours, anything), you get the same kind back. Without them the function would return plain `EarnSlot`s and the builder would lose the fields it needs.

## Motivation without pressure

A design note, since this is the feature most likely to go wrong. Rewards here only ever *add*: nothing is taken away for a slow week, there is no streak to break, and the count is of decisions written down, which is the habit the app exists for. The first reward comes after a single decision, so the idea is clear on day one.

## Read more
- `Array.prototype.flatMap` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap>
- Generic constraints (TypeScript handbook): <https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints>
- Choosing the state structure: avoid redundant state (React): <https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state>

---

## Exercise 11.6

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 11.6: A collection to earn

**Edit:** `app/shared/collection.ts` · **Tests:** `tests/part-11/11.6-collection.test.ts` · **Run:** `npm run ex 11.6`

Write `isUnlocked`, `rewardsOf(slots)`, `collection(rewards, decisions, before)` and `openSlots(slots, decisions)`. Then record a decision and find the bonsai among the plants.

> **Take it further:** announce a new item when it opens. In `TasksView`, count the decisions before and after `recordOutcome` and show `collection(...).fresh` in a message.

---

[← 11c Your pictures](c-your-pictures.md) · [11e Shipping updates →](e-shipping-updates.md)
