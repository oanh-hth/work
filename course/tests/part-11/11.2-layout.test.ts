import { sceneScale, toScene, movePart, partTransform, normalizePos, LIMITS } from "@app/shared/layout";
import { frozen } from "../helpers";

describe("11.2 sceneScale and toScene", () => {
  it("uses the larger ratio, like cover", () => {
    expect(sceneScale({ width: 1200, height: 800 })).toBe(1);
    expect(sceneScale({ width: 2400, height: 800 })).toBe(2);
    expect(sceneScale({ width: 390, height: 844 })).toBeCloseTo(1.055, 3);
  });
  it("turns screen pixels into scene units", () => {
    expect(toScene(100, -50, { width: 2400, height: 800 })).toEqual({ dx: 50, dy: -25 });
    const phone = toScene(105.5, 0, { width: 390, height: 844 });
    expect(phone.dx).toBeCloseTo(100, 5);
  });
});

describe("11.2 movePart", () => {
  const pos = frozen({ plant: { x: 10, y: 20, s: 1 } });
  it("moves a part, and starts from home for a new one", () => {
    expect(movePart(pos, "plant", 5, -30)).toEqual({ plant: { x: 15, y: -10, s: 1 } });
    expect(movePart(pos, "seat", 40, 0)).toEqual({ plant: { x: 10, y: 20, s: 1 }, seat: { x: 40, y: 0, s: 1 } });
    expect(pos.plant).toEqual({ x: 10, y: 20, s: 1 });
  });
  it("rounds positions to whole units and sizes to 2 decimals", () => {
    expect(movePart(pos, "plant", 0.4, 0.6)).toEqual({ plant: { x: 10, y: 21, s: 1 } });
    expect(movePart(pos, "plant", 0, 0, 0.1).plant!.s).toBe(1.1);
    expect(movePart(movePart(movePart(pos, "plant", 0, 0, 0.1), "plant", 0, 0, 0.1), "plant", 0, 0, 0.1).plant!.s).toBe(1.3);
  });
  it("stays within the limits", () => {
    expect(movePart(pos, "plant", 5000, -5000, 9).plant).toEqual({ x: LIMITS.x, y: -LIMITS.y, s: LIMITS.max });
    expect(movePart(pos, "plant", 0, 0, -9).plant!.s).toBe(LIMITS.min);
    expect(movePart(pos, "plant", 500, 0, 0, { x: 100, y: 100, min: 1, max: 1 }).plant!.x).toBe(100);
  });
});

describe("11.2 partTransform", () => {
  it("moves, then grows around the anchor", () => {
    expect(partTransform({ x: 30, y: -10, s: 1.5 }, [556, 640])).toBe("translate(30 -10) translate(556 640) scale(1.5) translate(-556 -640)");
  });
  it("is the identity for a part that was never moved", () => {
    expect(partTransform(undefined, [100, 200])).toBe("translate(0 0) translate(100 200) scale(1) translate(-100 -200)");
  });
});

describe("11.2 normalizePos", () => {
  const parts = ["plant", "seat", "board"];
  it("keeps valid positions of known parts, clamped", () => {
    expect(normalizePos({ plant: { x: 10.4, y: 2, s: 1.234 }, seat: { x: 99999, y: 0, s: 0.1 }, sofa: { x: 1, y: 1, s: 1 } }, parts))
      .toEqual({ plant: { x: 10, y: 2, s: 1.23 }, seat: { x: LIMITS.x, y: 0, s: LIMITS.min } });
  });
  it("drops broken positions and survives anything", () => {
    expect(normalizePos({ plant: { x: "a", y: 0, s: 1 }, seat: { x: 1, y: 2 }, board: null }, parts)).toEqual({});
    expect(normalizePos({ plant: { x: NaN, y: 0, s: 1 }, seat: { x: 0, y: Infinity, s: 1 } }, parts)).toEqual({});
    for (const junk of [null, undefined, "x", 7, []]) expect(normalizePos(junk, parts)).toEqual({});
  });
});
