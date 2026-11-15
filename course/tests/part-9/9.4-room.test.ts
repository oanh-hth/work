import { timeOfDay, roomState } from "@app/shared/room";
import { task } from "../helpers";

describe("9.4 timeOfDay", () => {
  it("splits the day at 6, 11, 17 and 21", () => {
    expect([0, 5, 6, 10, 11, 16, 17, 20, 21, 23].map(timeOfDay))
      .toEqual(["night", "night", "morning", "morning", "day", "day", "evening", "evening", "night", "night"]);
  });
});

describe("9.4 roomState", () => {
  const today = "2026-11-14";
  const done = (id: string, doneAt = today) => task(id, { status: "done", doneAt });
  it("starts with a full cup and a calm room", () => {
    expect(roomState([], today, 9)).toEqual({ time: "morning", left: 1, mood: "calm" });
    expect(roomState([task("a"), task("b")], today, 14)).toEqual({ time: "day", left: 1, mood: "calm" });
  });
  it("empties the cup as today's tasks get done", () => {
    expect(roomState([task("a"), done("b"), done("c"), done("d")], today, 14).left).toBeCloseTo(0.25, 5);
    expect(roomState([done("a"), done("b")], today, 19)).toEqual({ time: "evening", left: 0, mood: "calm" });
  });
  it("doesn't count what was done on other days", () => {
    expect(roomState([task("a"), done("b", "2026-11-13")], today, 14).left).toBe(1);
  });
  it("is alert when something is overdue", () => {
    expect(roomState([task("a", { due: "2026-11-13" })], today, 22)).toMatchObject({ time: "night", mood: "alert" });
    expect(roomState([task("a", { due: today })], today, 22).mood).toBe("calm");
  });
});
