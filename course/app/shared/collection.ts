// Exercise 11.6: A collection to earn. Read curriculum/part-11/d-a-collection.md first.

/** The least a slot needs for this exercise: options may say after how many recorded decisions they open. */
export interface Earnable { id: string; name: string; unlock?: number }
export interface EarnSlot<O extends Earnable = Earnable> { id: string; name: string; options: readonly O[] }
/** An option you earn: which slot it belongs to, and the number of decisions that opens it. */
export interface Reward { slot: string; slotName: string; id: string; name: string; unlock: number }
export interface Collection {
  earned: Reward[];       // open now
  next: Reward | null;    // the first one still locked, or null when you have them all
  fresh: Reward[];        // opened between `before` and now: what to announce
}

/** An option without `unlock` is always open; one with `unlock: n` opens once you have n decisions or more. */
export function isUnlocked(option: Earnable, decisions: number): boolean {
  // TODO 11.6
  throw new Error("TODO 11.6");
}

/** Every option that has to be earned, cheapest first. Equal costs stay in slot order, then option order. */
export function rewardsOf(slots: readonly EarnSlot[]): Reward[] {
  // TODO 11.6
  throw new Error("TODO 11.6");
}

/**
 * Where you stand with `decisions` recorded decisions, given `rewards` sorted as rewardsOf returns them.
 * `before` is the count before your latest decision (leave it out and nothing is fresh).
 */
export function collection(rewards: readonly Reward[], decisions: number, before: number = decisions): Collection {
  // TODO 11.6
  throw new Error("TODO 11.6");
}

/** The same slots with only the options that are open. Used for the builder's choices and for "Surprise me". */
export function openSlots<O extends Earnable, S extends EarnSlot<O>>(slots: readonly S[], decisions: number): S[] {
  // TODO 11.6
  throw new Error("TODO 11.6");
}
