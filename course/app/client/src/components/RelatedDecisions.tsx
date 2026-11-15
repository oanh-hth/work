// Exercise 9.2: RelatedDecisions. Read curriculum/part-9/a-earlier-decisions.md first.
import type { Decision } from "@app/shared/decisions";
import { Todo } from "@app/client/src/components/Todo";

/**
 * Nothing at all (return null) when `decisions` is empty. Otherwise
 * <section className="related" aria-label="Earlier decisions"> with:
 * - an <h3>: "You've decided about <topic> before" when `topic` is given, else "Earlier decisions that may help"
 * - a <ul> with one <li> per decision: the sticker (<Sticker id> from 8.4) when it has one,
 *   its title in a <b>, a <time dateTime={doneAt}>, and the decision text
 */
export function RelatedDecisions({ decisions, topic }: { decisions: readonly Decision[]; topic?: string }) {
  // TODO 9.2
  return <Todo exercise="9.2" what="Earlier decisions on this topic" />;
}
