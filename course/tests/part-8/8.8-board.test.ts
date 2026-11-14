import { placeBoard, boardNotes, type BoardSpot } from "@app/shared/board";
import { task, decided } from "../helpers";

const coffee: BoardSpot = { x: 612, y: 112, w: 316, h: 246, look: "chalk" };
const near = (r: Record<string, number>, want: Record<string, number>) => { for (const k in want) expect(r[k]).toBeCloseTo(want[k]!, 1); };

describe("8.8 placeBoard", () => {
  it("maps the spot 1:1 when the screen is the scene's size", () => {
    near({ ...placeBoard(coffee, { width: 1200, height: 800 }, 56) }, { left: 612, top: 112, width: 316, height: 246, fontSize: 15.8 });
  });
  it("scales with the screen and crops like cover (wide screen: scale 2, the top is cut off)", () => {
    // scale 2, offsetY = -400 → top would be -176: kept under the header
    near({ ...placeBoard(coffee, { width: 2400, height: 800 }, 56) }, { left: 1224, top: 64, width: 632, height: 492, fontSize: 16 });
  });
  it("keeps it fully on screen on a phone", () => {
    // scale 844/800, offsetX = (390 - 1266) / 2 = -438 → left 207.7 would overflow: pulled back to 390 - width - 8
    const r = placeBoard(coffee, { width: 390, height: 844 }, 100);
    near({ ...r }, { width: 333.4, height: 259.5, left: 48.6, top: 118.2 });
    expect(r.left + r.width).toBeLessThanOrEqual(390 - 8 + 0.01);
  });
  it("never gets narrower than 230px, growing around its centre", () => {
    // scale 0.5: 158 × 123 at (306, 56) → 230 × 179.1, centre kept: (270, 28) → top kept under the 40px header
    near({ ...placeBoard(coffee, { width: 600, height: 400 }, 40) }, { width: 230, height: 179.1, left: 270, top: 48, fontSize: 11.5 });
  });
  it("sizes the text with the board, at most 16px", () => {
    expect(placeBoard({ ...coffee, w: 100, h: 60 }, { width: 1200, height: 800 }, 0).fontSize).toBeCloseTo(11.5, 5);  // grown to 230 wide
    expect(placeBoard(coffee, { width: 3600, height: 2400 }, 0).fontSize).toBe(16);                                   // 948 wide
  });
});

describe("8.8 boardNotes", () => {
  const today = "2026-11-14";
  const tasks = [
    task("a", { title: "Later", due: "2026-11-20" }),
    task("b", { title: "Late", due: "2026-11-10" }),
    task("c", { title: "No date" }),
    task("d", { title: "Today", due: today, complexity: "complex" }),
    task("e", { title: "Also open" }),
    task("f", { status: "done", doneAt: today }),
    decided("g", today),
    task("h", { status: "done", doneAt: "2026-11-13" }),
  ];
  it("counts open, overdue and done today", () => {
    expect(boardNotes(tasks, today)).toMatchObject({ open: 5, overdue: 1, doneToday: 2 });
  });
  it("lists the next three open tasks in sortTasks order", () => {
    expect(boardNotes(tasks, today).next.map(t => t.title)).toEqual(["Late", "Today", "Later"]);
  });
  it("is calm when everything is done", () => {
    expect(boardNotes([task("x", { status: "done", doneAt: today })], today)).toEqual({ open: 0, overdue: 0, doneToday: 1, next: [] });
  });
});
