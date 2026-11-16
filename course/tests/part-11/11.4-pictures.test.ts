import { fitInside, isImageData, setImage, normalizeImages } from "@app/shared/pictures";
import { frozen } from "../helpers";

const PNG = "data:image/png;base64,AAAA", JPG = "data:image/jpeg;base64,BBBB";

describe("11.4 fitInside", () => {
  it("shrinks the longer side to max and keeps the shape", () => {
    expect(fitInside(4000, 3000, 1400)).toEqual({ width: 1400, height: 1050 });
    expect(fitInside(3000, 4000, 500)).toEqual({ width: 375, height: 500 });
    expect(fitInside(1000, 1000, 700)).toEqual({ width: 700, height: 700 });
  });
  it("never enlarges", () => {
    expect(fitInside(300, 200, 1400)).toEqual({ width: 300, height: 200 });
  });
  it("gives whole pixels, at least 1 × 1", () => {
    expect(fitInside(1001, 333, 500)).toEqual({ width: 500, height: 166 });
    expect(fitInside(5000, 2, 100)).toEqual({ width: 100, height: 1 });
  });
});

describe("11.4 isImageData", () => {
  it("accepts image data URLs only", () => {
    expect(isImageData(PNG)).toBe(true);
    expect(isImageData(JPG)).toBe(true);
    for (const v of ["https://example.com/a.png", "data:text/html,<b>x</b>", "image/png", "", null, undefined, 5, {}]) expect(isImageData(v)).toBe(false);
  });
});

describe("11.4 setImage", () => {
  const images = frozen({ poster: PNG });
  it("sets and replaces without changing its argument", () => {
    expect(setImage(images, "view", JPG)).toEqual({ poster: PNG, view: JPG });
    expect(setImage(images, "poster", JPG)).toEqual({ poster: JPG });
    expect(images).toEqual({ poster: PNG });
  });
  it("removes with null", () => {
    expect(setImage(images, "poster", null)).toEqual({});
  });
  it("ignores anything that isn't image data", () => {
    const next = setImage(images, "view", "https://example.com/a.png");
    expect(next).toEqual(images);
    expect(next).not.toBe(images);
  });
});

describe("11.4 normalizeImages", () => {
  it("keeps image data of known kinds", () => {
    expect(normalizeImages({ poster: PNG, view: "https://x", wall: JPG, sticker: PNG }, ["poster", "view", "wall"])).toEqual({ poster: PNG, wall: JPG });
  });
  it("survives anything", () => {
    for (const junk of [null, undefined, "x", 7, [], { poster: 1 }]) expect(normalizeImages(junk, ["poster"])).toEqual({});
  });
});
