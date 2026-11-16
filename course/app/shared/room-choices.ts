// Exercise 10.1: The rules of a room. Read curriculum/part-10/a-a-room-from-data.md first.
/** A slot of the room and its choices. The drawings live in art/room.ts; these rules only need ids and names. */
export interface SlotDef { id: string; name: string; options: readonly { id: string; name: string }[] }
/** One choice per slot: { wall: "sage", plant: "cactus", ... } */
export type Room = Record<string, string>;

/**
 * A complete, valid room from anything that was saved (it may be null, a string, an old version, or edited by hand):
 * exactly one entry per slot, in slot order. Keep a saved choice only when it is a string and one of that slot's option ids;
 * otherwise use defaults[slot.id]. Ignore keys that aren't slots.
 */
export function normalizeRoom(slots: readonly SlotDef[], defaults: Room, saved: unknown): Room {
  // TODO 10.1
  throw new Error("TODO 10.1");
}

/** A new room with one choice changed. An unknown slot or option changes nothing (but still returns a normalized room). Never changes `room`. */
export function setSlot(slots: readonly SlotDef[], defaults: Room, room: Room, slotId: string, optionId: string): Room {
  // TODO 10.1
  throw new Error("TODO 10.1");
}

/**
 * A random room: for each slot, the option at index Math.floor(random() * options.length).
 * `random` returns a number from 0 (included) to 1 (excluded), like Math.random; it's a parameter so tests can control it.
 */
export function randomRoom(slots: readonly SlotDef[], random: () => number = Math.random): Room {
  // TODO 10.1
  throw new Error("TODO 10.1");
}
