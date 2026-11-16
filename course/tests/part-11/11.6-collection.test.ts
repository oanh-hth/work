import { isUnlocked, rewardsOf, collection, openSlots, type EarnSlot } from "@app/shared/collection";
import { frozen } from "../helpers";

const slots: EarnSlot[] = frozen([
  { id: "plant", name: "Plant", options: [{ id: "fern", name: "Fern" }, { id: "bonsai", name: "Bonsai", unlock: 1 }, { id: "none", name: "No plant" }] },
  { id: "light", name: "Light", options: [{ id: "neon", name: "Neon sign", unlock: 10 }, { id: "lamp", name: "Lamp" }] },
  { id: "drink", name: "Drink", options: [{ id: "tea", name: "Tea" }, { id: "bubble", name: "Bubble tea", unlock: 5 }, { id: "soda", name: "Soda", unlock: 10 }] },
]);

describe("11.6 isUnlocked", () => {
  it("opens free options always and earned ones at their number", () => {
    expect(isUnlocked({ id: "a", name: "A" }, 0)).toBe(true);
    expect(isUnlocked({ id: "b", name: "B", unlock: 5 }, 4)).toBe(false);
    expect(isUnlocked({ id: "b", name: "B", unlock: 5 }, 5)).toBe(true);
    expect(isUnlocked({ id: "b", name: "B", unlock: 5 }, 6)).toBe(true);
  });
});

describe("11.6 rewardsOf", () => {
  it("lists earned options cheapest first, ties in slot order", () => {
    expect(rewardsOf(slots)).toEqual([
      { slot: "plant", slotName: "Plant", id: "bonsai", name: "Bonsai", unlock: 1 },
      { slot: "drink", slotName: "Drink", id: "bubble", name: "Bubble tea", unlock: 5 },
      { slot: "light", slotName: "Light", id: "neon", name: "Neon sign", unlock: 10 },
      { slot: "drink", slotName: "Drink", id: "soda", name: "Soda", unlock: 10 },
    ]);
  });
  it("is empty when nothing has to be earned", () => {
    expect(rewardsOf([{ id: "wall", name: "Wall", options: [{ id: "cream", name: "Cream" }] }])).toEqual([]);
  });
});

describe("11.6 collection", () => {
  const rewards = rewardsOf(slots);
  const ids = (xs: { id: string }[]) => xs.map(x => x.id);
  it("starts with nothing earned and the cheapest next", () => {
    const c = collection(rewards, 0);
    expect(c.earned).toEqual([]);
    expect(c.next?.id).toBe("bonsai");
    expect(c.fresh).toEqual([]);
  });
  it("knows what is earned and what comes next", () => {
    const c = collection(rewards, 7);
    expect(ids(c.earned)).toEqual(["bonsai", "bubble"]);
    expect(c.next?.id).toBe("neon");
  });
  it("announces what opened since the count before", () => {
    expect(ids(collection(rewards, 1, 0).fresh)).toEqual(["bonsai"]);
    expect(ids(collection(rewards, 10, 9).fresh)).toEqual(["neon", "soda"]);
    expect(collection(rewards, 4, 3).fresh).toEqual([]);
    expect(collection(rewards, 3, 4).fresh).toEqual([]);   // a decision was deleted: nothing new
  });
  it("has no next when everything is collected", () => {
    const c = collection(rewards, 99);
    expect(c.earned).toHaveLength(4);
    expect(c.next).toBeNull();
  });
});

describe("11.6 openSlots", () => {
  it("keeps only the open options, and everything else about each slot", () => {
    const open = openSlots(slots, 5);
    expect(open.map(s => s.options.map(o => o.id))).toEqual([["fern", "bonsai", "none"], ["lamp"], ["tea", "bubble"]]);
    expect(open.map(s => [s.id, s.name])).toEqual([["plant", "Plant"], ["light", "Light"], ["drink", "Drink"]]);
  });
  it("doesn't change the slots it was given", () => {
    openSlots(slots, 0);
    expect(slots[1]!.options).toHaveLength(2);
  });
});
