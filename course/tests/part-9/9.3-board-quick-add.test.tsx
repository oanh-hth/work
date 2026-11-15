// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardQuickAdd } from "@app/client/src/components/BoardQuickAdd";

const setup = () => {
  const onAdd = vi.fn(), onClose = vi.fn();
  render(<BoardQuickAdd onAdd={onAdd} onClose={onClose} />);
  return { onAdd, onClose, input: screen.getByRole("textbox", { name: "Add a task" }), box: screen.getByRole("checkbox", { name: "Needs a decision" }) };
};

describe("9.3 BoardQuickAdd", () => {
  it("is a named form that starts with the focus in its input", () => {
    const { input } = setup();
    expect(screen.getByRole("form", { name: "Add a task" })).toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(screen.getByRole("button", { name: "Add" })).toHaveAttribute("type", "submit");
  });
  it("adds a simple task with Enter, then is ready for the next one", async () => {
    const { onAdd, input } = setup();
    await userEvent.type(input, "  Water the plants  {Enter}");
    expect(onAdd).toHaveBeenCalledWith("Water the plants", "simple");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });
  it("adds a complex task when the box is ticked, and unticks it after", async () => {
    const { onAdd, input, box } = setup();
    await userEvent.type(input, "Pick a router");
    await userEvent.click(box);
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith("Pick a router", "complex");
    expect(box).not.toBeChecked();
    expect(input).toHaveFocus();
  });
  it("adds nothing without a title", async () => {
    const { onAdd, input } = setup();
    await userEvent.type(input, "   {Enter}");
    expect(onAdd).not.toHaveBeenCalled();
  });
  it("closes with Escape", async () => {
    const { onClose, input } = setup();
    await userEvent.type(input, "{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
