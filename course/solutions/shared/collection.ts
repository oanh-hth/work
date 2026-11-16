// Reference solution for exercise 11.6.

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

export function isUnlocked(option: Earnable, decisions: number): boolean {
  return (option.unlock ?? 0) <= decisions;
}

export function rewardsOf(slots: readonly EarnSlot[]): Reward[] {
  return slots
    .flatMap(slot => slot.options.filter(o => o.unlock).map(o => ({ slot: slot.id, slotName: slot.name, id: o.id, name: o.name, unlock: o.unlock! })))
    .sort((a, b) => a.unlock - b.unlock);   // stable: equal costs keep their order
}

export function collection(rewards: readonly Reward[], decisions: number, before: number = decisions): Collection {
  return {
    earned: rewards.filter(r => r.unlock <= decisions),
    next: rewards.find(r => r.unlock > decisions) ?? null,
    fresh: rewards.filter(r => r.unlock > before && r.unlock <= decisions),
  };
}

export function openSlots<O extends Earnable, S extends EarnSlot<O>>(slots: readonly S[], decisions: number): S[] {
  return slots.map(slot => ({ ...slot, options: slot.options.filter(o => isUnlocked(o, decisions)) }));
}
