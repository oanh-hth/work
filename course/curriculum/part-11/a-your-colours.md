# Part 11a: Your colours

*[Part 11: Make it yours](README.md) · section a*

The builder offers eight walls. You want a ninth: exactly the yellow of your notebook. This section adds a colour picker for the wall, the floor and the furniture.

## A colour is three numbers

`#ffcc00` is three numbers written in base 16: red `ff` (255), green `cc` (204), blue `00` (0), each from 0 to 255. To work with a colour you take it apart, do arithmetic, and put it back:

```ts
parseInt("cc", 16)                 // 204
(204).toString(16)                 // "cc"
(5).toString(16).padStart(2, "0")  // "05": always two digits, or "#050505" becomes "#555"
```

Furniture in the room is drawn with two colours: the main one and a darker one for the parts in shadow (the sofa's arms, the desk's legs). When you pick a colour you pick one; the app makes the second. **Darker** means every channel a bit closer to zero, so multiply each by a factor below 1, round, and keep the result between 0 and 255:

```ts
shade("#ff8040", 0.5)  // "#804020"
```

That's the whole of `shade`. Real design tools use better colour spaces (HSL, OKLCH) where "darker" keeps the hue more faithfully; per-channel scaling is the simple version and good enough for a sofa.

## Trust nothing: is it a colour?

`<input type="color">` always gives `#rrggbb`. Saved data doesn't promise anything. `isHex` is the gate, and it is a **type guard** like the one in 10a:

```ts
export function isHex(value: unknown): value is string { return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value); }
```

Read the pattern piece by piece: `^` start, `#`, `[0-9a-f]` one hex digit, `{6}` six of them, `$` end, `i` any case. Without `^` and `$` it would also accept `"red #ff0000 please"`.

Why does it matter? The colour goes into an SVG string: `fill="${color}"`. A "colour" like `"/><script>…` would become markup. The rule from 8a, *only inject strings you made yourself*, holds only if everything that reaches the string is checked. `isHex` is that check.

## Stored separately, validated separately

The room's choices are `{ wall: "sage", ... }` (10.1). Your colours live beside them, in a second small record: `{ wall: "#ffcc00" }`. Keeping them apart means 10.1's rules and tests didn't change at all, and each kind of data gets a rule sized for it: `setColor` to change one (null means "back to the standard colour"), `normalizeColors` to clean what was saved.

The drawing code (given) then prefers your colour: `colors.wall ?? wall.color`.

## Read more
- `<input type="color">` (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color>
- `parseInt` and `Number.prototype.toString` with a radix (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt>
- `String.prototype.padStart` (MDN): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart>

---

## Exercise 11.1

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 11.1: Your own colours

**Edit:** `app/shared/colors.ts` · **Tests:** `tests/part-11/11.1-colors.test.ts` · **Run:** `npm run ex 11.1`

Write `isHex`, `shade(hex, factor)`, `setColor(colors, slotId, color)` and `normalizeColors(saved, slotIds)`. Then choose **My room** in Settings and give the wall, the floor and the furniture your own colours.

---

[← Part 10b The room builder](../part-10/b-the-room-builder.md) · [11b Move and resize →](b-move-and-resize.md)
