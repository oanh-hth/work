import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Complexity } from "@app/shared/types";

export function BoardQuickAdd({ onAdd, onClose }: { onAdd: (title: string, complexity: Complexity) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [complex, setComplex] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (clean) { onAdd(clean, complex ? "complex" : "simple"); setTitle(""); setComplex(false); }
    input.current?.focus();
  };
  return (
    <form className="board-form" aria-label="Add a task" onSubmit={submit} onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
      <input ref={input} aria-label="Add a task" placeholder="Add a task…" autoComplete="off" value={title} onChange={e => setTitle(e.target.value)} />
      <label className="check"><input type="checkbox" checked={complex} onChange={e => setComplex(e.target.checked)} /> Needs a decision</label>
      <button type="submit" className="primary">Add</button>
    </form>
  );
}
