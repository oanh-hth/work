// Reference solution for exercise 9.1.
import type { Decision } from "@app/shared/decisions";

/** Filler words that say nothing about the topic. */
export const STOP_WORDS: ReadonlySet<string> = new Set(["the", "and", "for", "with", "from", "that", "this", "what", "when", "which", "how", "have", "about", "into", "over", "should", "would", "could", "does", "will", "your", "then", "than", "some", "use", "make", "pick", "choose", "decide", "handle", "check", "update"]);

export interface RelatedOptions {
  category?: string;         // the category being chosen, "" when none yet
  title?: string;            // the title of the task being decided
  excludeId?: string | null; // the task itself, when it already has an outcome
  limit?: number;            // at most this many, 3 by default
}

export function keywords(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])].filter(word => !STOP_WORDS.has(word));
}

export function relatedDecisions(decisions: readonly Decision[], options: RelatedOptions = {}): Decision[] {
  const { category = "", title = "", excludeId = null, limit = 3 } = options;
  const words = keywords(title);
  return decisions
    .filter(d => d.taskId !== excludeId)
    .map(d => {
      const theirs = new Set(keywords(`${d.title} ${d.decision}`));
      return { d, score: (category && d.category === category ? 2 : 0) + words.filter(word => theirs.has(word)).length };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)   // Array.prototype.sort is stable: equal scores keep their order
    .slice(0, limit)
    .map(x => x.d);
}
