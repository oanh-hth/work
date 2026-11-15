// Exercise 9.1: Earlier decisions on the same topic. Read curriculum/part-9/a-earlier-decisions.md first.
import type { Decision } from "@app/shared/decisions";

/** Filler words that say nothing about the topic. */
export const STOP_WORDS: ReadonlySet<string> = new Set(["the", "and", "for", "with", "from", "that", "this", "what", "when", "which", "how", "have", "about", "into", "over", "should", "would", "could", "does", "will", "your", "then", "than", "some", "use", "make", "pick", "choose", "decide", "handle", "check", "update"]);

export interface RelatedOptions {
  category?: string;         // the category being chosen, "" when none yet
  title?: string;            // the title of the task being decided
  excludeId?: string | null; // the task itself, when it already has an outcome
  limit?: number;            // at most this many, 3 by default
}

/**
 * The distinct words of a text that say something about its topic, in the order they first appear:
 * lower case, 3 letters or digits or more (any alphabet: use /[\p{L}\p{N}]{3,}/gu), without STOP_WORDS.
 * keywords("Pick a way to manage state, the State way") → ["way", "manage", "state"]
 */
export function keywords(text: string): string[] {
  // TODO 9.1
  throw new Error("TODO 9.1");
}

/**
 * Decisions worth re-reading before deciding again. Score each decision (except excludeId):
 *   2 points when its category is the given category (and a category was given),
 *   plus 1 point for each keyword of `title` that is also a keyword of the decision's title + decision text.
 * Keep scores above 0, best first; equal scores stay in the order received (newest first); at most `limit`.
 */
export function relatedDecisions(decisions: readonly Decision[], options: RelatedOptions = {}): Decision[] {
  // TODO 9.1
  throw new Error("TODO 9.1");
}
