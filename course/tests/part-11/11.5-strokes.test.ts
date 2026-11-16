import { padReducer, strokeWidth, initialPad, type PadAction, type PadState, type Point } from "@app/shared/strokes";
import { frozen } from "../helpers";

const p = (x: number, y: number, pressure = 0.5): Point => [x, y, pressure];
const run = (actions: PadAction[], from: PadState = initialPad) => actions.reduce((s, a) => padReducer(frozen(s), a), from);

describe("11.5 strokeWidth", () => {
  it("draws the pen size at finger pressure and follows the pencil", () => {
    expect(strokeWidth(6, 0.5)).toBe(6);
    expect(strokeWidth(6, 1)).toBe(9);
    expect(strokeWidth(10, 0)).toBe(5);
  });
});

describe("11.5 padReducer", () => {
  it("starts a stroke with the current ink and size", () => {
    const s = run([{ type: "start", point: p(1, 2) }]);
    expect(s).toEqual({ ...initialPad, drawing: true, strokes: [{ color: initialPad.color, size: initialPad.size, points: [p(1, 2)] }] });
  });
  it("adds points while the pen is down", () => {
    const s = run([{ type: "start", point: p(0, 0) }, { type: "move", point: p(1, 1, 0.8) }, { type: "move", point: p(2, 2) }, { type: "end" }]);
    expect(s.strokes).toHaveLength(1);
    expect(s.strokes[0]!.points).toEqual([p(0, 0), p(1, 1, 0.8), p(2, 2)]);
    expect(s.drawing).toBe(false);
  });
  it("ignores movement when the pen is up", () => {
    const before = run([{ type: "start", point: p(0, 0) }, { type: "end" }]);
    expect(padReducer(frozen(before), { type: "move", point: p(9, 9) })).toBe(before);
    expect(padReducer(frozen(initialPad), { type: "move", point: p(9, 9) })).toBe(initialPad);
  });
  it("uses a new ink and size for the next stroke only", () => {
    const s = run([{ type: "start", point: p(0, 0) }, { type: "end" }, { type: "ink", color: "#E4572E" }, { type: "size", size: 14 }, { type: "start", point: p(5, 5) }]);
    expect(s.strokes.map(x => [x.color, x.size])).toEqual([[initialPad.color, initialPad.size], ["#E4572E", 14]]);
  });
  it("undoes the newest stroke", () => {
    const two = run([{ type: "start", point: p(0, 0) }, { type: "end" }, { type: "start", point: p(5, 5) }, { type: "move", point: p(6, 6) }]);
    const s = padReducer(frozen(two), { type: "undo" });
    expect(s.strokes).toEqual([two.strokes[0]]);
    expect(s.drawing).toBe(false);
    expect(run([{ type: "undo" }]).strokes).toEqual([]);
  });
  it("clears everything but keeps the ink and size", () => {
    const s = run([{ type: "ink", color: "#4E7FD9" }, { type: "start", point: p(0, 0) }, { type: "clear" }]);
    expect(s).toEqual({ ...initialPad, color: "#4E7FD9" });
  });
  it("never changes the state it was given", () => {
    // frozen() makes any mutation throw; this runs every action on frozen states
    expect(() => run([{ type: "start", point: p(0, 0) }, { type: "move", point: p(1, 1) }, { type: "end" }, { type: "start", point: p(2, 2) }, { type: "undo" }, { type: "clear" }])).not.toThrow();
  });
});
