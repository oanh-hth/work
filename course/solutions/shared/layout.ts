// Reference solution for exercise 11.2.
import type { PartPos } from "@app/shared/room-extras";
import { SCENE, type Viewport } from "@app/shared/board";

/** How far a thing may go from where it started (scene units), and how small or big it may get. */
export interface Limits { x: number; y: number; min: number; max: number }
export const LIMITS: Limits = { x: 1000, y: 520, min: 0.5, max: 1.8 };
export const HOME: PartPos = { x: 0, y: 0, s: 1 };

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(lo, v), hi);
const tidy = (p: PartPos, limits: Limits): PartPos => ({
  x: clamp(Math.round(p.x), -limits.x, limits.x),
  y: clamp(Math.round(p.y), -limits.y, limits.y),
  s: clamp(Math.round(p.s * 100) / 100, limits.min, limits.max),
});

export function sceneScale(viewport: Viewport): number {
  return Math.max(viewport.width / SCENE.width, viewport.height / SCENE.height);
}

export function toScene(dx: number, dy: number, viewport: Viewport): { dx: number; dy: number } {
  const scale = sceneScale(viewport);
  return { dx: dx / scale, dy: dy / scale };
}

export function movePart(pos: Readonly<Record<string, PartPos>>, partId: string, dx: number, dy: number, ds = 0, limits: Limits = LIMITS): Record<string, PartPos> {
  const p = pos[partId] ?? HOME;
  return { ...pos, [partId]: tidy({ x: p.x + dx, y: p.y + dy, s: p.s + ds }, limits) };
}

export function partTransform(p: PartPos | undefined, anchor: readonly [number, number]): string {
  const { x, y, s } = p ?? HOME, [ax, ay] = anchor;
  return `translate(${x} ${y}) translate(${ax} ${ay}) scale(${s}) translate(${-ax} ${-ay})`;
}

export function normalizePos(saved: unknown, partIds: readonly string[], limits: Limits = LIMITS): Record<string, PartPos> {
  const from = typeof saved === "object" && saved !== null ? saved as Record<string, unknown> : {};
  const out: Record<string, PartPos> = {};
  for (const id of partIds) {
    const p = from[id] as Partial<PartPos> | null | undefined;
    if (p && typeof p === "object" && [p.x, p.y, p.s].every(n => typeof n === "number" && Number.isFinite(n))) out[id] = tidy(p as PartPos, limits);
  }
  return out;
}
