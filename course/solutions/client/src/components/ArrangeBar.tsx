import { useId } from "react";

export interface ArrangeBarProps {
  parts: readonly { id: string; name: string }[];   // the things in the room right now
  selected: string;                                 // the id of the one being moved
  scale: number;                                    // its size: 1 is 100%
  onSelect: (partId: string) => void;
  onMove: (dx: number, dy: number) => void;         // in scene units
  onResize: (ds: number) => void;
  onReset: () => void;
  onDone: () => void;
}
export const STEP = 20;         // one press of an arrow, in scene units
export const SIZE_STEP = 0.1;   // one press of − or +

const ARROWS: [label: string, text: string, dx: number, dy: number][] = [
  ["Move left", "←", -STEP, 0], ["Move up", "↑", 0, -STEP], ["Move down", "↓", 0, STEP], ["Move right", "→", STEP, 0],
];

export function ArrangeBar({ parts, selected, scale, onSelect, onMove, onResize, onReset, onDone }: ArrangeBarProps) {
  const id = useId();
  return (
    <div role="toolbar" aria-label="Arrange the room" className="arrange-bar">
      <p className="hint">Drag things in the room to move them, or use the buttons.</p>
      <label htmlFor={id}>Item</label>
      <select id={id} value={selected} onChange={e => onSelect(e.target.value)}>
        {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <span role="group" aria-label="Move" className="pad-keys">
        {ARROWS.map(([label, text, dx, dy]) => <button key={label} type="button" aria-label={label} onClick={() => onMove(dx, dy)}>{text}</button>)}
      </span>
      <span role="group" aria-label="Size" className="pad-keys">
        <button type="button" aria-label="Smaller" onClick={() => onResize(-SIZE_STEP)}>−</button>
        <span aria-live="polite" className="muted">{Math.round(scale * 100)}%</span>
        <button type="button" aria-label="Bigger" onClick={() => onResize(SIZE_STEP)}>+</button>
      </span>
      <button type="button" onClick={onReset}>Put everything back</button>
      <button type="button" className="primary" onClick={onDone}>Done</button>
    </div>
  );
}
