// Reference solution for exercise 10.1.
/** A slot of the room and its choices. The drawings live in art/room.ts; these rules only need ids and names. */
export interface SlotDef { id: string; name: string; options: readonly { id: string; name: string }[] }
/** One choice per slot: { wall: "sage", plant: "cactus", ... } */
export type Room = Record<string, string>;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function normalizeRoom(slots: readonly SlotDef[], defaults: Room, saved: unknown): Room {
  const from = isRecord(saved) ? saved : {};
  const room: Room = {};
  for (const slot of slots) {
    const choice = from[slot.id];
    room[slot.id] = typeof choice === "string" && slot.options.some(o => o.id === choice) ? choice : defaults[slot.id]!;
  }
  return room;
}

export function setSlot(slots: readonly SlotDef[], defaults: Room, room: Room, slotId: string, optionId: string): Room {
  const clean = normalizeRoom(slots, defaults, room);
  const valid = slots.some(slot => slot.id === slotId && slot.options.some(o => o.id === optionId));
  return valid ? { ...clean, [slotId]: optionId } : clean;
}

export function randomRoom(slots: readonly SlotDef[], random: () => number = Math.random): Room {
  const room: Room = {};
  for (const slot of slots) room[slot.id] = slot.options[Math.floor(random() * slot.options.length)]!.id;
  return room;
}
