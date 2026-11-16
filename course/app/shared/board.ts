// Exercise 8.8: The board on the wall. Read curriculum/part-8/d-the-board.md first.
import type { Day, Task } from "@app/shared/types";
import { weekSummary } from "@app/shared/summary";
import { sortTasks } from "@app/shared/collections";

/** A spot on a scene's wall, in the scene's own 1200 × 800 coordinates, and how the board looks there. */
export interface BoardSpot { x: number; y: number; w: number; h: number; look: "chalk" | "cork" | "white" }
/** Where the board goes on the screen, in CSS pixels. */
export interface ScreenRect { left: number; top: number; width: number; height: number; fontSize: number }
export interface Viewport { width: number; height: number }
export const SCENE = { width: 1200, height: 800 } as const;
export const MIN_WIDTH = 230;   // never smaller than this, so it stays readable on a phone
export const MARGIN = 8;        // gap to the screen edges and under the header

/** What the board shows: counts for today and the next three open tasks. */
export interface BoardNotes { open: number; overdue: number; doneToday: number; next: Task[] }

/**
 * The scene fills the screen like object-fit: cover (preserveAspectRatio="xMidYMid slice"):
 *   scale = max(viewport.width / 1200, viewport.height / 800), and the scene is centred, so it overflows on one side.
 * 1. Map the spot to the screen: left = offsetX + spot.x * scale, and the same for top, width and height.
 * 2. If the width is under MIN_WIDTH, grow width and height by the same factor around the spot's centre.
 * 3. Keep it fully on screen: left between MARGIN and viewport.width - width - MARGIN,
 *    top between headerHeight + MARGIN and viewport.height - height - MARGIN.
 * 4. fontSize = width / 20, kept between 11 and 16.
 */
export function placeBoard(spot: BoardSpot, viewport: Viewport, headerHeight: number): ScreenRect {
  // TODO 8.8
  throw new Error("TODO 8.8");
}

/** open and overdue from weekSummary (2.4), doneToday too; next = the first three "todo" tasks in sortTasks (2.2) order. */
export function boardNotes(tasks: readonly Task[], today: Day): BoardNotes {
  // TODO 8.8
  throw new Error("TODO 8.8");
}
