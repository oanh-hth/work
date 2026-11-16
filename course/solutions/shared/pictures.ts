// Reference solution for exercise 11.4.

export interface Size { width: number; height: number }

export function fitInside(width: number, height: number, max: number): Size {
  const k = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)) };
}

export function isImageData(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

export function setImage(images: Readonly<Record<string, string>>, kind: string, data: string | null): Record<string, string> {
  const next = { ...images };
  if (data === null) delete next[kind];
  else if (isImageData(data)) next[kind] = data;
  return next;
}

export function normalizeImages(saved: unknown, kinds: readonly string[]): Record<string, string> {
  const from = typeof saved === "object" && saved !== null ? saved as Record<string, unknown> : {};
  const out: Record<string, string> = {};
  for (const kind of kinds) { const v = from[kind]; if (isImageData(v)) out[kind] = v; }
  return out;
}
