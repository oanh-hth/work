// @vitest-environment jsdom
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VersionInfo } from "@app/client/src/components/VersionInfo";

/** A promise we settle by hand, to look at the component while it waits. */
function deferred() {
  let resolve!: () => void, reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe("11.7 VersionInfo", () => {
  it("says which version this is", () => {
    render(<VersionInfo version={3} date="16 Nov 2026" onCheck={async () => {}} />);
    const section = screen.getByRole("region", { name: "Version" });
    expect(section).toHaveTextContent("Version 3 · 16 Nov 2026");
    expect(within(section).getByRole("button", { name: "Check for updates" })).toHaveAttribute("type", "button");
  });
  it("is busy while the check runs, then ready again", async () => {
    const d = deferred(), onCheck = vi.fn(() => d.promise);
    render(<VersionInfo version={3} date="16 Nov 2026" onCheck={onCheck} />);
    await userEvent.click(screen.getByRole("button", { name: "Check for updates" }));
    const busy = screen.getByRole("button", { name: "Checking…" });
    expect(busy).toBeDisabled();
    await userEvent.click(busy);
    expect(onCheck).toHaveBeenCalledTimes(1);
    d.resolve();
    await waitFor(() => expect(screen.getByRole("button", { name: "Check for updates" })).toBeEnabled());
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("says so when the check fails, and recovers", async () => {
    const first = deferred(), onCheck = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce(undefined);
    render(<VersionInfo version={3} date="16 Nov 2026" onCheck={onCheck} />);
    await userEvent.click(screen.getByRole("button", { name: "Check for updates" }));
    first.reject(new Error("offline"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't check. Are you online?");
    expect(screen.getByRole("button", { name: "Check for updates" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Check for updates" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });
});
