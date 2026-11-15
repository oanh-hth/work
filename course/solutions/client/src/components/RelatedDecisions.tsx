import type { Decision } from "@app/shared/decisions";
import { Sticker } from "@app/client/src/components/Stickers";

export function RelatedDecisions({ decisions, topic }: { decisions: readonly Decision[]; topic?: string }) {
  if (decisions.length === 0) return null;
  return (
    <section className="related" aria-label="Earlier decisions">
      <h3>{topic ? `You've decided about ${topic} before` : "Earlier decisions that may help"}</h3>
      <ul>
        {decisions.map(d => (
          <li key={d.taskId}>
            {d.sticker && <Sticker id={d.sticker} />}
            <span><b>{d.title}</b> <time dateTime={d.doneAt}>{d.doneAt}</time><br />{d.decision}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
