import { keywords, relatedDecisions } from "@app/shared/related";
import type { Decision } from "@app/shared/decisions";
import { frozen } from "../helpers";

const d = (taskId: string, title: string, decision: string, category: string, doneAt = "2026-11-10"): Decision =>
  ({ taskId, title, doneAt, result: "r", decision, category, sticker: null });

describe("9.1 keywords", () => {
  it("keeps distinct lower-case words of 3+ characters, in order", () => {
    expect(keywords("Pick a way to manage state, the State way")).toEqual(["way", "manage", "state"]);
  });
  it("drops filler words and short words", () => {
    expect(keywords("Decide how to handle the form with CSS")).toEqual(["form", "css"]);
  });
  it("understands other alphabets and numbers", () => {
    expect(keywords("Chọn thư viện biểu mẫu cho React 18")).toEqual(["chọn", "thư", "viện", "biểu", "mẫu", "cho", "react"]);
    expect(keywords("")).toEqual([]);
  });
});

describe("9.1 relatedDecisions", () => {
  const list = frozen([
    d("1", "Pick a way to manage state", "No state library for now", "state", "2026-11-14"),
    d("2", "Choose a form library", "Plain React state and one validate function per form", "forms", "2026-11-13"),
    d("3", "Check colour contrast", "Darken the muted colour", "accessibility", "2026-11-12"),
    d("4", "Server state", "Fetch in a hook, keep it out of the reducer", "state", "2026-11-11"),
    d("5", "Validate the sign-up form", "Validate on submit, then on change", "forms", "2026-11-10"),
  ]);
  const ids = (xs: Decision[]) => xs.map(x => x.taskId);
  it("finds decisions in the same category, newest first", () => {
    expect(ids(relatedDecisions(list, { category: "state" }))).toEqual(["1", "4"]);
  });
  it("finds decisions that share words with the title", () => {
    expect(ids(relatedDecisions(list, { title: "Decide how to validate the checkout form" }))).toEqual(["2", "5"]);   // both share "validate" and "form": a tie keeps the newest first
  });
  it("adds category and words together, best first", () => {
    // 2: category 2 + "form" 1 = 3 · 5: category 2 + "form" 1 = 3 · 1: "state" 1 · 4: "state" 1
    expect(ids(relatedDecisions(list, { category: "forms", title: "Form state", limit: 10 }))).toEqual(["2", "5", "1", "4"]);
  });
  it("leaves out the task itself and unrelated decisions", () => {
    expect(ids(relatedDecisions(list, { category: "state", excludeId: "1" }))).toEqual(["4"]);
    expect(relatedDecisions(list, { title: "Water the plants" })).toEqual([]);
    expect(relatedDecisions(list)).toEqual([]);
  });
  it("returns at most 3 unless told otherwise", () => {
    const many = [...list, d("6", "State again", "x", "state"), d("7", "More state", "y", "state")];
    expect(relatedDecisions(many, { category: "state" })).toHaveLength(3);
    expect(relatedDecisions(many, { category: "state", limit: 1 })).toHaveLength(1);
  });
});
