// Exercise 11.7: VersionInfo. Read curriculum/part-11/e-shipping-updates.md first.
import { Todo } from "@app/client/src/components/Todo";

/**
 * <section aria-label="Version"> with:
 * - the text "Version <version> · <date>"
 * - a button "Check for updates" (type="button"). Clicking it calls onCheck(), which returns a promise.
 *   Until that promise settles (resolves or rejects) the button is disabled and reads "Checking…";
 *   afterwards it is enabled and reads "Check for updates" again.
 * - when onCheck rejects, show "Couldn't check. Are you online?" in an element with role="alert";
 *   a later successful check removes it.
 */
export function VersionInfo({ version, date, onCheck }: { version: number; date: string; onCheck: () => Promise<void> }) {
  // TODO 11.7
  return <Todo exercise="11.7" what="The version and the update button" />;
}
