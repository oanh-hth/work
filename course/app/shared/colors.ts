// Exercise 11.1: Your own colours. Read curriculum/part-11/a-your-colours.md first.

/** Is this a colour written as "#" and six hex digits ("#1a2B3c")? Anything else, of any type, is not. */
export function isHex(value: unknown): value is string {
  // TODO 11.1
  throw new Error("TODO 11.1");
}

/**
 * A darker (factor below 1) or lighter (above 1) shade: multiply the red, green and blue channels by `factor`,
 * round, keep each between 0 and 255, and write it back as lower-case "#rrggbb" (two digits per channel, always).
 * shade("#ff8040", 0.5) → "#804020"
 */
export function shade(hex: string, factor = 0.82): string {
  // TODO 11.1
  throw new Error("TODO 11.1");
}

/**
 * New colours with one slot changed. A valid colour is stored in lower case; null removes the slot's colour
 * (back to the standard one); anything invalid changes nothing. Never changes `colors`.
 */
export function setColor(colors: Readonly<Record<string, string>>, slotId: string, color: string | null): Record<string, string> {
  // TODO 11.1
  throw new Error("TODO 11.1");
}

/** Valid colours from anything that was saved: only the slots in `slotIds`, only valid colours, in lower case. */
export function normalizeColors(saved: unknown, slotIds: readonly string[]): Record<string, string> {
  // TODO 11.1
  throw new Error("TODO 11.1");
}
