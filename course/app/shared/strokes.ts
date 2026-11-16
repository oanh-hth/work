// Exercise 11.5: A drawing as data. Read curriculum/part-11/c-your-pictures.md first.

/** One point of a line: where, and how hard the pen pressed (0 to 1; 0.5 for a finger or a mouse). */
export type Point = readonly [x: number, y: number, pressure: number];
export interface Stroke { color: string; size: number; points: Point[] }
export interface PadState {
  strokes: Stroke[];   // everything drawn so far, oldest first
  color: string;       // the ink for the next stroke
  size: number;        // the pen size for the next stroke
  drawing: boolean;    // is the pen down right now?
}
export type PadAction =
  | { type: "start"; point: Point }   // pen down: a new stroke with the current colour and size
  | { type: "move"; point: Point }    // pen moved: add the point to the stroke being drawn
  | { type: "end" }                   // pen up
  | { type: "undo" }                  // remove the newest stroke
  | { type: "clear" }                 // remove everything
  | { type: "ink"; color: string }
  | { type: "size"; size: number };
export const initialPad: PadState = { strokes: [], color: "#1D2227", size: 6, drawing: false };

/** How wide to draw at this pressure: size × (0.5 + pressure). A finger (0.5) draws exactly `size`. */
export function strokeWidth(size: number, pressure: number): number {
  // TODO 11.5
  throw new Error("TODO 11.5");
}

/**
 * - start: add a stroke { color, size, points: [point] } and set drawing
 * - move: add the point to the last stroke, only while drawing (otherwise return the same state)
 * - end: stop drawing
 * - undo: remove the last stroke and stop drawing; clear: remove them all and stop drawing
 * - ink, size: change what the NEXT stroke uses; strokes already drawn keep theirs
 * Never change the state or anything inside it: return new objects and arrays.
 */
export function padReducer(state: PadState, action: PadAction): PadState {
  // TODO 11.5
  throw new Error("TODO 11.5");
}
