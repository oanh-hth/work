// Given: the drawing pad. Your padReducer (11.5) holds the drawing as data; this component turns pointer events
// into its actions and paints the result on a <canvas>.
import { useEffect, useReducer, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { initialPad, padReducer, strokeWidth, type Point } from "@app/shared/strokes";

const INKS = ["#1D2227", "#E4572E", "#E8C35A", "#4E9A60", "#4E7FD9", "#9A6FD0", "#F28BA8", "#FFFFFF"];
const SIZES: [number, string][] = [[3, "Fine"], [6, "Medium"], [14, "Thick"]];
const PAPER = "#FBF7EE", W = 462, H = 582;   // three times the poster's frame in the room

export function DrawingPad({ base, onSave, onCancel }: { base?: string; onSave: (data: string) => void; onCancel: () => void }) {
  const [pad, dispatch] = useReducer(padReducer, initialPad);
  const canvas = useRef<HTMLCanvasElement>(null);
  // Carry on from the poster you already have, until you press Clear.
  const [under, setUnder] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!base) return;
    const im = new Image();
    im.onload = () => setUnder(im);
    im.src = base;
  }, [base]);

  // Paint: the canvas is drawn again from the data every time the data changes. Simple, and undo comes for free.
  useEffect(() => {
    const g = canvas.current?.getContext("2d");
    if (!g) return;
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    if (under) g.drawImage(under, 0, 0, W, H);
    g.lineCap = g.lineJoin = "round";
    for (const stroke of pad.strokes) {
      g.strokeStyle = g.fillStyle = stroke.color;
      const pts = stroke.points, first = pts[0]!;
      if (pts.length === 1) { g.beginPath(); g.arc(first[0], first[1], strokeWidth(stroke.size, first[2]) / 2, 0, Math.PI * 2); g.fill(); continue; }
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]!, b = pts[i]!;
        g.lineWidth = strokeWidth(stroke.size, b[2]);   // each segment has its own width: that is how pressure shows
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
    }
  }, [pad.strokes, under]);

  /** A pointer event as a point on the canvas. The canvas is shown smaller than its 462 × 582 pixels, so scale. */
  const at = (e: PointerEvent<HTMLCanvasElement> | globalThis.PointerEvent): Point => {
    const box = canvas.current!.getBoundingClientRect();
    return [(e.clientX - box.left) * W / box.width, (e.clientY - box.top) * H / box.height, e.pointerType === "pen" && e.pressure ? e.pressure : 0.5];
  };

  // A portal, so the pad covers the screen and not just the panel it was opened from (see TasksView).
  return createPortal(
    <div className="overlay">
      <div className="outcome-form draw" role="dialog" aria-label="Draw a poster" onKeyDown={e => { if (e.key === "Escape") onCancel(); }}>
        <h2>Draw a poster</h2>
        <canvas ref={canvas} id="pad" width={W} height={H} aria-label="Drawing area"
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); dispatch({ type: "start", point: at(e) }); }}
          onPointerMove={e => { if (!pad.drawing) return; for (const ev of e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]) dispatch({ type: "move", point: at(ev) }); }}
          onPointerUp={() => dispatch({ type: "end" })} onPointerCancel={() => dispatch({ type: "end" })} />
        <div className="row inks" role="radiogroup" aria-label="Colour">
          {INKS.map((c, i) => <button key={c} type="button" role="radio" className="ink" aria-checked={pad.color === c} aria-label={`Colour ${i + 1}`} style={{ background: c }} onClick={() => dispatch({ type: "ink", color: c })} />)}
        </div>
        <div className="row">
          <span className="seg" role="radiogroup" aria-label="Pen size">
            {SIZES.map(([n, label]) => <button key={n} type="button" role="radio" aria-checked={pad.size === n} onClick={() => dispatch({ type: "size", size: n })}>{label}</button>)}
          </span>
          <button type="button" onClick={() => dispatch({ type: "undo" })}>Undo</button>
          <button type="button" onClick={() => { setUnder(null); dispatch({ type: "clear" }); }}>Clear</button>
        </div>
        <div className="row">
          <button type="button" className="primary" onClick={() => onSave(canvas.current!.toDataURL("image/jpeg", 0.9))}>Hang it on the wall</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body);
}
