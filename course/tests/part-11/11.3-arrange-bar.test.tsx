// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrangeBar, STEP, SIZE_STEP } from "@app/client/src/components/ArrangeBar";

const parts = [{ id: "window", name: "Window" }, { id: "plant", name: "Plant" }, { id: "board", name: "Board" }];
const setup = (scale = 1) => {
  const on = { onSelect: vi.fn(), onMove: vi.fn(), onResize: vi.fn(), onReset: vi.fn(), onDone: vi.fn() };
  render(<ArrangeBar parts={parts} selected="plant" scale={scale} {...on} />);
  return { ...on, bar: screen.getByRole("toolbar", { name: "Arrange the room" }) };
};

describe("11.3 ArrangeBar", () => {
  it("lets you pick the item to move", async () => {
    const { onSelect, bar } = setup();
    const select = within(bar).getByRole("combobox", { name: "Item" });
    expect(select).toHaveValue("plant");
    expect(within(select).getAllByRole("option").map(o => o.textContent)).toEqual(["Window", "Plant", "Board"]);
    await userEvent.selectOptions(select, "board");
    expect(onSelect).toHaveBeenCalledWith("board");
  });
  it("moves with four named buttons", async () => {
    const { onMove, bar } = setup();
    const group = within(bar).getByRole("group", { name: "Move" });
    expect(within(group).getAllByRole("button").map(b => b.getAttribute("aria-label"))).toEqual(["Move left", "Move up", "Move down", "Move right"]);
    for (const name of ["Move left", "Move up", "Move down", "Move right"]) await userEvent.click(within(group).getByRole("button", { name }));
    expect(onMove.mock.calls).toEqual([[-STEP, 0], [0, -STEP], [0, STEP], [STEP, 0]]);
  });
  it("resizes, and says the size as a percentage", async () => {
    const { onResize, bar } = setup(1.2);
    const group = within(bar).getByRole("group", { name: "Size" });
    const live = group.querySelector("[aria-live=polite]");
    expect(live).toHaveTextContent("120%");
    await userEvent.click(within(group).getByRole("button", { name: "Smaller" }));
    await userEvent.click(within(group).getByRole("button", { name: "Bigger" }));
    expect(onResize.mock.calls).toEqual([[-SIZE_STEP], [SIZE_STEP]]);
  });
  it("rounds the percentage", () => {
    const { bar } = setup(0.7000000000000001);
    expect(bar).toHaveTextContent("70%");
  });
  it("has Put everything back and Done, and only type=button buttons", async () => {
    const { onReset, onDone, bar } = setup();
    await userEvent.click(within(bar).getByRole("button", { name: "Put everything back" }));
    await userEvent.click(within(bar).getByRole("button", { name: "Done" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(within(bar).getAllByRole("button").every(b => b.getAttribute("type") === "button")).toBe(true);
  });
});
