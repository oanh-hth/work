// Reference solution for exercise 11.5.

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

export function strokeWidth(size: number, pressure: number): number {
  return size * (0.5 + pressure);
}

export function padReducer(state: PadState, action: PadAction): PadState {
  switch (action.type) {
    case "start":
      return { ...state, drawing: true, strokes: [...state.strokes, { color: state.color, size: state.size, points: [action.point] }] };
    case "move": {
      const last = state.strokes[state.strokes.length - 1];
      if (!state.drawing || !last) return state;
      return { ...state, strokes: [...state.strokes.slice(0, -1), { ...last, points: [...last.points, action.point] }] };
    }
    case "end": return { ...state, drawing: false };
    case "undo": return { ...state, drawing: false, strokes: state.strokes.slice(0, -1) };
    case "clear": return { ...state, drawing: false, strokes: [] };
    case "ink": return { ...state, color: action.color };
    case "size": return { ...state, size: action.size };
  }
}
