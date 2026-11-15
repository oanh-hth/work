// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { RelatedDecisions } from "@app/client/src/components/RelatedDecisions";
import type { Decision } from "@app/shared/decisions";

const d = (taskId: string, title: string, decision: string, sticker: string | null = null): Decision =>
  ({ taskId, title, doneAt: "2026-11-14", result: "r", decision, category: "state", sticker });
const list = [d("1", "Pick a way to manage state", "No state library for now", "idea"), d("2", "Server state", "Fetch in a hook")];

describe("9.2 RelatedDecisions", () => {
  it("lists each decision with its title, day and text", () => {
    render(<RelatedDecisions decisions={list} />);
    const region = screen.getByRole("region", { name: "Earlier decisions" });
    expect(within(region).getByRole("heading", { level: 3, name: "Earlier decisions that may help" })).toBeInTheDocument();
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Pick a way to manage state");
    expect(items[0]).toHaveTextContent("No state library for now");
    expect(items[0]!.querySelector("b")).toHaveTextContent("Pick a way to manage state");
    expect(items[0]!.querySelector("time")).toHaveAttribute("datetime", "2026-11-14");
    expect(items[1]).toHaveTextContent("Fetch in a hook");
  });
  it("names the topic when there is one", () => {
    render(<RelatedDecisions decisions={list} topic="State management" />);
    expect(screen.getByRole("heading", { name: "You've decided about State management before" })).toBeInTheDocument();
  });
  it("shows the sticker of decisions that have one", () => {
    render(<RelatedDecisions decisions={list} />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]!).getByRole("img", { name: "Sticker: Insight" })).toBeInTheDocument();
    expect(within(items[1]!).queryByRole("img")).toBeNull();
  });
  it("renders nothing without decisions", () => {
    const { container } = render(<RelatedDecisions decisions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
