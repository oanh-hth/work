// Given: what a room can carry on top of its choices (Part 11). Types only; the rules are yours to write.

/** Where you moved a thing (x, y, in scene units from where it started) and how you resized it (s: 1 is its drawn size). */
export interface PartPos { x: number; y: number; s: number }

export interface RoomExtras {
  colors: Record<string, string>;   // your own colour per slot: { wall: "#ffcc00" }            (11.1)
  pos: Record<string, PartPos>;     // where you put things: { plant: { x: 40, y: -10, s: 1.2 } } (11.2)
  images: Record<string, string>;   // your pictures as data URLs: { poster: "data:image/jpeg;base64,…" } (11.4)
}
export const NO_EXTRAS: RoomExtras = { colors: {}, pos: {}, images: {} };
