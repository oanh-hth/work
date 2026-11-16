// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomBuilder } from "@app/client/src/components/RoomBuilder";
import type { RoomSlot } from "@app/client/src/art/room";

const slots: RoomSlot[] = [
  { id: "wall", name: "Wall", options: [{ id: "cream", name: "Cream", color: "#E8D5BE" }, { id: "sage", name: "Sage", color: "#C9D6C3" }] },
  { id: "plant", name: "Plant", options: [{ id: "fern", name: "Leafy plant" }, { id: "cactus", name: "Cactus" }, { id: "none", name: "No plant" }] },
];
const room = { wall: "sage", plant: "cactus" };
const setup = () => {
  const onChange = vi.fn(), onRandom = vi.fn(), onReset = vi.fn();
  render(<RoomBuilder slots={slots} room={room} onChange={onChange} onRandom={onRandom} onReset={onReset} />);
  return { onChange, onRandom, onReset };
};

describe("10.2 RoomBuilder", () => {
  it("shows one named radio group per slot, with a heading", () => {
    setup();
    const section = screen.getByRole("region", { name: "Build your room" });
    const groups = within(section).getAllByRole("radiogroup");
    expect(groups).toHaveLength(2);
    expect(within(section).getByRole("radiogroup", { name: "Wall" })).toBe(groups[0]);
    expect(within(section).getByRole("radiogroup", { name: "Plant" })).toBe(groups[1]);
    expect(within(section).getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["Wall", "Plant"]);
  });
  it("offers each option as a radio and marks the chosen one", () => {
    setup();
    const plant = screen.getByRole("radiogroup", { name: "Plant" });
    const radios = within(plant).getAllByRole("radio");
    expect(radios.map(r => r.textContent)).toEqual(["Leafy plant", "Cactus", "No plant"]);
    expect(radios.map(r => r.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);
    expect(radios.every(r => r.getAttribute("type") === "button")).toBe(true);
    expect(within(screen.getByRole("radiogroup", { name: "Wall" })).getByRole("radio", { name: "Sage" })).toHaveAttribute("aria-checked", "true");
  });
  it("shows a colour swatch only for options that have a colour", () => {
    setup();
    const cream = screen.getByRole("radio", { name: "Cream" }).querySelector<HTMLElement>(".swatch");
    expect(cream).not.toBeNull();
    expect(cream!.style.background).not.toBe("");
    expect(screen.getByRole("radio", { name: "Cactus" }).querySelector(".swatch")).toBeNull();
  });
  it("reports the slot and the option that was clicked", async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole("radio", { name: "No plant" }));
    expect(onChange).toHaveBeenCalledWith("plant", "none");
    await userEvent.click(screen.getByRole("radio", { name: "Cream" }));
    expect(onChange).toHaveBeenLastCalledWith("wall", "cream");
  });
  it("has Surprise me and Start again", async () => {
    const { onRandom, onReset } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Surprise me" }));
    await userEvent.click(screen.getByRole("button", { name: "Start again" }));
    expect(onRandom).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
