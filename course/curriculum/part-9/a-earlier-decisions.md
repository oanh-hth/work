# Part 9a: Earlier decisions

*[Part 9: An app that works with you](README.md) · section a*

A decision log has a weakness: you only read it when you remember to look. The moment an old decision is most useful is the moment you're about to make a new one on the same topic. So the app brings them to you: while you record a result, it lists the earlier decisions that may help.

## Finding "related" without a search engine

Two cheap signals are enough:

- **Same category.** If you're filing under *Forms*, your other *Forms* decisions matter. Worth 2 points.
- **Shared words.** A task called "Validate the checkout form" is related to a decision titled "Validate the sign-up form". Worth 1 point per shared word.

Add the points, keep what scores above zero, show the best three. That's a ranking function, and it's the same shape as the queries from Part 2: `map` each decision to `{ decision, score }`, `filter`, `sort`, `slice`, `map` back.

```ts
decisions
  .map(d => ({ d, score: /* ... */ }))
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(x => x.d);
```

### Stable sort gives you "newest first" for free

`decisionsOf` (2.3) already returns decisions newest first. `Array.prototype.sort` is **stable**: items that compare equal keep their original order. So sorting by score alone leaves ties newest first. You don't need a second comparison, but you do need to know why it works.

## Words, in any alphabet

To compare words you first need words. `text.split(" ")` leaves punctuation attached ("state," ≠ "state"). A regular expression that matches letters and digits is better, and with the `u` flag it understands every alphabet, including Vietnamese:

```ts
"Chọn thư viện, cho React 18".toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)
// ["chọn", "thư", "viện", "cho", "react"]
```

`\p{L}` is "any letter", `\p{N}` "any digit", `{3,}` "three or more" (so "CSS" and "API" count, "a" and "to" don't). `match` returns `null` when nothing matches, hence `?? []`. Then two clean-ups: a `Set` removes repeats, and a list of **stop words** ("the", "with", "decide", "handle"…) removes words that appear in every task and say nothing about its topic.

## Showing them: quiet when there's nothing

`RelatedDecisions` renders the list, and renders **nothing** when the list is empty: `return null`. An empty box saying "No related decisions" every time would teach you to ignore the box. Help that appears only when it has something to say keeps its value.

The Tasks page (given) puts it next to your outcome form, matching on the task's title, and on its category when you're editing a decision that already has one.

> **Take it further:** the category you pick lives inside `OutcomeForm` (3.4), so the list can't react to it while you choose. Lift that state up: give `OutcomeForm` an `onCategoryChange` prop, keep the category in `TasksView`, and pass it to `relatedDecisions`. This is the "lifting state up" move from Part 3.

## Read more
- `Array.prototype.sort`, sort stability (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_stability>
- Unicode character class escape `\p{...}` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape>
- Conditional rendering (React): <https://react.dev/learn/conditional-rendering>

---

## Exercises 9.1–9.2

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 9.1: Earlier decisions on the same topic

**Edit:** `app/shared/related.ts` · **Tests:** `tests/part-9/9.1-related.test.ts` · **Run:** `npm run ex 9.1`

Write `keywords(text)`: distinct lower-case words of three or more letters or digits, in any alphabet, without the stop words. Then `relatedDecisions(decisions, options)`: 2 points for the same category, 1 per shared keyword, best first, ties newest first, at most three, never the task itself.

### 9.2: RelatedDecisions

**Edit:** `app/client/src/components/RelatedDecisions.tsx` · **Tests:** `tests/part-9/9.2-related-decisions.test.tsx` · **Run:** `npm run ex 9.2`

Build `RelatedDecisions`: a section named "Earlier decisions" with a heading (naming the topic when there is one) and a list item per decision with its sticker, title, day and text; and nothing at all when the list is empty. Then record a result for a task whose title shares a word with an old decision, and watch it appear.

---

[← Part 8d The board on the wall](../part-8/d-the-board.md) · [9b Add from the board →](b-add-from-the-board.md)
