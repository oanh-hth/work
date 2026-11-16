// Given: turning a picture file into something small enough to save. Uses fitInside (11.4).
import { fitInside } from "@app/shared/pictures";

/** Read a picture file and make it at most `max` pixels on its longer side, as a JPEG data URL. */
export async function shrinkImage(file: Blob, max: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitInside(bitmap.width, bitmap.height, max);
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#fff"; g.fillRect(0, 0, width, height);   // JPEG has no transparency: put white behind see-through pictures
  g.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
