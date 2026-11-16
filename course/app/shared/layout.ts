// Exercise 11.2: Move and resize. Read curriculum/part-11/b-move-and-resize.md first.
import type { PartPos } from "@app/shared/room-extras";
import { SCENE, type Viewport } from "@app/shared/board";

/** How far a thing may go from where it started (scene units), and how small or big it may get. */
export interface Limits { x: number; y: number; min: number; max: number }
export const LIMITS: Limits = { x: 1000, y: 520, min: 0.5, max: 1.8 };
export const HOME: PartPos = { x: 0, y: 0, s: 1 };

/** How many screen pixels one scene unit takes: the scene covers the screen (8.8), so the larger of the two ratios. */
export function sceneScale(viewport: Viewport): number {
  // TODO 11.2
  throw new Error("TODO 11.2");
}

/** A finger movement in screen pixels, as a movement in scene units. */
export function toScene(dx: number, dy: number, viewport: Viewport): { dx: number; dy: number } {
  // TODO 11.2
  throw new Error("TODO 11.2");
}

/**
 * New positions with one part moved by (dx, dy) and resized by ds, starting from HOME when it has no position yet.
 * x and y: rounded to whole units, kept within ±limits.x and ±limits.y. s: rounded to 2 decimals, kept within limits.min..max.
 * Never changes `pos`.
 */
export function movePart(pos: Readonly<Record<string, PartPos>>, partId: string, dx: number, dy: number, ds = 0, limits: Limits = LIMITS): Record<string, PartPos> {
  // TODO 11.2
  throw new Error("TODO 11.2");
}

/**
 * The SVG transform for a part: move it, then grow it around its anchor [ax, ay]:
 *   "translate(x y) translate(ax ay) scale(s) translate(-ax -ay)"   (HOME when `p` is undefined)
 */
export function partTransform(p: PartPos | undefined, anchor: readonly [number, number]): string {
  // TODO 11.2
  throw new Error("TODO 11.2");
}

/** Valid positions from anything that was saved: only parts in `partIds` whose x, y and s are finite numbers, clamped like movePart. */
export function normalizePos(saved: unknown, partIds: readonly string[], limits: Limits = LIMITS): Record<string, PartPos> {
  // TODO 11.2
  throw new Error("TODO 11.2");
}
