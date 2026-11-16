// Reference solution for exercise 11.1.

/** Is this a colour written as "#" and six hex digits ("#1a2B3c")? Anything else, of any type, is not. */
export function isHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function shade(hex: string, factor = 0.82): string {
  const channel = (start: number) => {
    const value = Math.round(parseInt(hex.slice(start, start + 2), 16) * factor);
    return Math.min(255, Math.max(0, value)).toString(16).padStart(2, "0");
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

export function setColor(colors: Readonly<Record<string, string>>, slotId: string, color: string | null): Record<string, string> {
  const next = { ...colors };
  if (color === null) delete next[slotId];
  else if (isHex(color)) next[slotId] = color.toLowerCase();
  return next;
}

export function normalizeColors(saved: unknown, slotIds: readonly string[]): Record<string, string> {
  const from = typeof saved === "object" && saved !== null ? saved as Record<string, unknown> : {};
  const out: Record<string, string> = {};
  for (const id of slotIds) { const c = from[id]; if (isHex(c)) out[id] = c.toLowerCase(); }
  return out;
}
