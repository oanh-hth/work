// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallBoard } from "@app/client/src/components/WallBoard";
import type { BoardNotes } from "@app/shared/board";
import { task } from "../helpers";

const notes = (extra: Partial<BoardNotes> = {}): BoardNotes =>
  ({ open: 4, overdue: 0, doneToday: 2, next: [task("1", { title: "Reply to Minh" }), task("2", { title: "Pick a router", complexity: "complex" })], ...extra });

describe("8.9 WallBoard", () => {
  it("is one button named by what's on it, and opens the app", async () => {
    const onOpen = vi.fn();
    render(<WallBoard notes={notes()} look="cork" onOpen={onOpen} />);
    const b = screen.getByRole("button", { name: "Open Threadwork: 4 to do, 2 done today" });
    expect(b).toHaveAttribute("type", "button");
    expect(b).toHaveClass("board");
    expect(b).toHaveAttribute("data-look", "cork");
    await userEvent.click(b);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
  it("shows the title, counts and the next tasks as tilted notes", () => {
    const { container } = render(<WallBoard notes={notes()} look="chalk" onOpen={() => {}} />);
    expect(container.querySelector(".b-title")).toHaveTextContent("Today");
    expect(container.querySelector(".b-stats")).toHaveTextContent("4 to do · 2 done");
    const n = [...container.querySelectorAll<HTMLElement>(".b-note")];
    expect(n.map(x => x.textContent)).toEqual(["Reply to Minh", "◆ Pick a router"]);
    expect(n.map(x => x.style.getPropertyValue("--r"))).toEqual(["-3deg", "2deg"]);
    expect(container.querySelector(".b-open")).toHaveTextContent("Tap to open");
  });
  it("mentions overdue tasks only when there are some", () => {
    const { container } = render(<WallBoard notes={notes({ overdue: 1 })} look="chalk" onOpen={() => {}} />);
    expect(container.querySelector(".b-stats")).toHaveTextContent("4 to do · 1 overdue · 2 done");
  });
  it("says all clear when nothing is next", () => {
    const { container } = render(<WallBoard notes={notes({ open: 0, next: [] })} look="chalk" onOpen={() => {}} />);
    expect([...container.querySelectorAll(".b-note")].map(x => x.textContent)).toEqual(["All clear ✓"]);
  });
  it("uses only phrasing content inside the button", () => {
    const { container } = render(<WallBoard notes={notes()} look="chalk" onOpen={() => {}} />);
    expect(container.querySelector("button.board")).not.toBeNull();
    expect(container.querySelector(".board div, .board p, .board h1, .board h2, .board h3, .board ul")).toBeNull();
  });
});
