// Reference solution for exercise 8.8.
import type { Day, Task } from "@app/shared/types";
import { weekSummary } from "@app/shared/summary";
import { sortTasks } from "@app/shared/collections";

/** A spot on a scene's wall, in the scene's own 1200 × 800 coordinates, and how the board looks there. */
export interface BoardSpot { x: number; y: number; w: number; h: number; look: "chalk" | "cork" }
/** Where the board goes on the screen, in CSS pixels. */
export interface ScreenRect { left: number; top: number; width: number; height: number; fontSize: number }
export interface Viewport { width: number; height: number }
export const SCENE = { width: 1200, height: 800 } as const;
export const MIN_WIDTH = 230;   // never smaller than this, so it stays readable on a phone
export const MARGIN = 8;        // gap to the screen edges and under the header

/** What the board shows: counts for today and the next three open tasks. */
export interface BoardNotes { open: number; overdue: number; doneToday: number; next: Task[] }

export function placeBoard(spot: BoardSpot, viewport: Viewport, headerHeight: number): ScreenRect {
  const { width: W, height: H } = viewport;
  const scale = Math.max(W / SCENE.width, H / SCENE.height);
  const offsetX = (W - SCENE.width * scale) / 2, offsetY = (H - SCENE.height * scale) / 2;
  let left = offsetX + spot.x * scale, top = offsetY + spot.y * scale, width = spot.w * scale, height = spot.h * scale;
  if (width < MIN_WIDTH) {
    const k = MIN_WIDTH / width;
    left -= (width * k - width) / 2; top -= (height * k - height) / 2;
    width *= k; height *= k;
  }
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(lo, v), hi);
  left = clamp(left, MARGIN, W - width - MARGIN);
  top = clamp(top, headerHeight + MARGIN, H - height - MARGIN);
  return { left, top, width, height, fontSize: clamp(width / 20, 11, 16) };
}

export function boardNotes(tasks: readonly Task[], today: Day): BoardNotes {
  const s = weekSummary(tasks, today);
  return { open: s.open, overdue: s.overdue, doneToday: s.doneToday, next: sortTasks(tasks).filter(t => t.status === "todo").slice(0, 3) };
}
