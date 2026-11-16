import { normalizeRoom, setSlot, randomRoom, type SlotDef, type Room } from "@app/shared/room-choices";
import { frozen } from "../helpers";

const opt = (id: string) => ({ id, name: id });
const slots: SlotDef[] = frozen([
  { id: "wall", name: "Wall", options: [opt("cream"), opt("sage"), opt("brick")] },
  { id: "plant", name: "Plant", options: [opt("fern"), opt("cactus"), opt("none")] },
  { id: "board", name: "Board", options: [opt("cork"), opt("chalk")] },
]);
const defaults: Room = frozen({ wall: "sage", plant: "fern", board: "cork" });

describe("10.1 normalizeRoom", () => {
  it("keeps valid choices", () => {
    expect(normalizeRoom(slots, defaults, { wall: "brick", plant: "none", board: "chalk" })).toEqual({ wall: "brick", plant: "none", board: "chalk" });
  });
  it("fills missing slots and replaces unknown choices with the defaults", () => {
    expect(normalizeRoom(slots, defaults, { wall: "gold", plant: "cactus" })).toEqual({ wall: "sage", plant: "cactus", board: "cork" });
  });
  it("drops keys that aren't slots, and keeps slot order", () => {
    const room = normalizeRoom(slots, defaults, { board: "chalk", sofa: "red", wall: "cream" });
    expect(room).toEqual({ wall: "cream", plant: "fern", board: "chalk" });
    expect(Object.keys(room)).toEqual(["wall", "plant", "board"]);
  });
  it("survives anything that was saved", () => {
    for (const junk of [null, undefined, "room", 42, [], ["brick"], { wall: 3, plant: null, board: ["chalk"] }])
      expect(normalizeRoom(slots, defaults, junk)).toEqual(defaults);
  });
  it("returns a new object", () => {
    expect(normalizeRoom(slots, defaults, defaults)).not.toBe(defaults);
  });
});

describe("10.1 setSlot", () => {
  const room: Room = frozen({ wall: "cream", plant: "cactus", board: "cork" });
  it("changes one choice without touching the room it was given", () => {
    expect(setSlot(slots, defaults, room, "plant", "none")).toEqual({ wall: "cream", plant: "none", board: "cork" });
    expect(room.plant).toBe("cactus");
  });
  it("ignores unknown options and unknown slots", () => {
    expect(setSlot(slots, defaults, room, "plant", "palm")).toEqual(room);
    expect(setSlot(slots, defaults, room, "ceiling", "blue")).toEqual(room);
  });
  it("repairs a broken room on the way", () => {
    expect(setSlot(slots, defaults, { wall: "gold" }, "board", "chalk")).toEqual({ wall: "sage", plant: "fern", board: "chalk" });
  });
});

describe("10.1 randomRoom", () => {
  it("picks the option at floor(random × options) for each slot, in slot order", () => {
    const values = [0, 0.5, 0.99];   // wall: index 0 of 3 · plant: index 1 of 3 · board: index 1 of 2
    let i = 0;
    expect(randomRoom(slots, () => values[i++]!)).toEqual({ wall: "cream", plant: "cactus", board: "chalk" });
  });
  it("always gives a valid room", () => {
    for (let n = 0; n < 50; n++) { const room = randomRoom(slots); expect(normalizeRoom(slots, defaults, room)).toEqual(room); }
  });
});
