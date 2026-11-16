// Exercise 11.4: Your pictures. Read curriculum/part-11/c-your-pictures.md first.

export interface Size { width: number; height: number }

/**
 * The size a picture should be saved at: at most `max` pixels on its longer side, the same shape, never enlarged,
 * whole pixels (rounded) and at least 1 × 1.
 * fitInside(4000, 3000, 1400) → { width: 1400, height: 1050 }
 */
export function fitInside(width: number, height: number, max: number): Size {
  // TODO 11.4
  throw new Error("TODO 11.4");
}

/** Is this a picture we made ourselves: a string that starts with "data:image/"? A web address is not. */
export function isImageData(value: unknown): value is string {
  // TODO 11.4
  throw new Error("TODO 11.4");
}

/** New pictures with one kind set, or removed with null. Anything that isn't image data changes nothing. Never changes `images`. */
export function setImage(images: Readonly<Record<string, string>>, kind: string, data: string | null): Record<string, string> {
  // TODO 11.4
  throw new Error("TODO 11.4");
}

/** Valid pictures from anything that was saved: only the kinds in `kinds`, only image data. */
export function normalizeImages(saved: unknown, kinds: readonly string[]): Record<string, string> {
  // TODO 11.4
  throw new Error("TODO 11.4");
}
