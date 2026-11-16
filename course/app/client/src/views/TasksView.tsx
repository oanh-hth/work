// Given: the Tasks page. Uses weekSummary (2.4), QuickCapture (3.2), TaskList (3.3), OutcomeForm (3.4), StickerPicker (8.4)
// and, while you record a result, the earlier decisions that may help (9.1, 9.2).
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@app/client/src/state/AppContext";
import { QuickCapture } from "@app/client/src/components/QuickCapture";
import { TaskList } from "@app/client/src/components/TaskList";
import { OutcomeForm } from "@app/client/src/components/OutcomeForm";
import { StickerPicker } from "@app/client/src/components/Stickers";
import { RelatedDecisions } from "@app/client/src/components/RelatedDecisions";
import { relatedDecisions } from "@app/shared/related";
import { decisionsOf } from "@app/shared/decisions";
import type { Task } from "@app/shared/types";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { weekSummary } from "@app/shared/summary";
import { categoryById } from "@app/shared/categories";
import { todayKey, newId } from "@app/client/src/views/shared";

function SummaryBar() {
  const { state } = useApp();
  const s = weekSummary(state.tasks, todayKey());
  return (
    <section className="summary" aria-label="This week">
      <div><b>{s.open}</b><span>to do</span></div>
      <div className={s.overdue ? "warn" : ""}><b>{s.overdue}</b><span>overdue</span></div>
      <div><b>{s.doneToday}</b><span>done today</span></div>
      <div><b>{s.doneThisWeek}</b><span>done this week</span></div>
      <div><b>{s.decisionsThisWeek}</b><span>decisions this week</span></div>
      {s.topCategory && <div className="wide"><b>{categoryById(s.topCategory.id)?.name ?? s.topCategory.id}</b><span>most decided this week</span></div>}
    </section>
  );
}

/** Earlier decisions with the same category (when the task already has one) or words in common with its title. */
function Related({ task }: { task: Task }) {
  const { state } = useApp();
  const category = task.outcome?.category ?? "";
  const list = relatedDecisions(decisionsOf(state.tasks), { category, title: task.title, excludeId: task.id });
  const topic = category && list.some(d => d.category === category) ? categoryById(category)?.name : undefined;
  return <RelatedDecisions decisions={list} topic={topic} />;
}

export function TasksView({ editId, onEdited }: { editId: string | null; onEdited: () => void }) {
  const { state, dispatch } = useApp();
  const [recording, setRecording] = useState<string | null>(editId);
  useEffect(() => { if (editId) setRecording(editId); }, [editId]);
  const today = todayKey();
  const task = state.tasks.find(t => t.id === recording) ?? null;
  const [sticker, setSticker] = useState<string | null>(null);
  useEffect(() => { setSticker(task?.outcome?.sticker ?? null); }, [task?.id]);
  const close = () => { setRecording(null); onEdited(); };
  return (
    <div className="stack">
      <ErrorBoundary area="This week"><SummaryBar /></ErrorBoundary>
      <ErrorBoundary area="Quick capture">
        <QuickCapture onAdd={(title, complexity, due) => dispatch({ type: "add", id: newId(), title, complexity, due, today })} />
      </ErrorBoundary>
      <ErrorBoundary area="The task list">
        <TaskList tasks={state.tasks} today={today}
          onComplete={id => dispatch({ type: "complete", id, today })}
          onRecord={setRecording}
          onReopen={id => dispatch({ type: "reopen", id })}
          onDelete={id => dispatch({ type: "delete", id })} />
      </ErrorBoundary>
      {/* A portal: the overlay is drawn at the top of the page, not inside the see-through panel. The panel's blur
          (backdrop-filter) would otherwise make "position: fixed" mean "fixed to the panel", and the form could land off screen. */}
      {task && createPortal(
        <div className="overlay">
          <div className="outcome-stack">
            <ErrorBoundary area="The outcome form">
              <OutcomeForm key={task.id} task={task} onCancel={close}
                onSave={outcome => {
                  dispatch({ type: "recordOutcome", id: task.id, outcome, today });
                  dispatch({ type: "setSticker", id: task.id, sticker });   // stickers come from Part 8
                  close();
                }} />
            </ErrorBoundary>
            <ErrorBoundary area="Earlier decisions"><Related task={task} /></ErrorBoundary>
            <ErrorBoundary area="Stickers"><StickerPicker value={sticker} onChange={setSticker} /></ErrorBoundary>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
