import { isHex, shade, setColor, normalizeColors } from "@app/shared/colors";
import { frozen } from "../helpers";

describe("11.1 isHex", () => {
  it("accepts # and six hex digits, in any case", () => {
    expect(["#000000", "#ffffff", "#1a2B3c", "#ABCDEF"].every(isHex)).toBe(true);
  });
  it("rejects everything else", () => {
    for (const v of ["", "red", "#fff", "#12345", "#1234567", "123456", "#12345g", " #123456", null, undefined, 0x123456, ["#123456"], {}])
      expect(isHex(v)).toBe(false);
  });
});

describe("11.1 shade", () => {
  it("multiplies each channel", () => {
    expect(shade("#ff8040", 0.5)).toBe("#804020");
    expect(shade("#646464", 1.5)).toBe("#969696");
  });
  it("keeps two digits per channel and lower case", () => {
    expect(shade("#0A0A0A", 0.5)).toBe("#050505");
    expect(shade("#ABCDEF", 1)).toBe("#abcdef");
    expect(shade("#000000", 0.5)).toBe("#000000");
  });
  it("stays between 0 and 255", () => {
    expect(shade("#ffc8ff", 2)).toBe("#ffffff");
  });
  it("is a little darker by default", () => {
    expect(shade("#646464")).toBe("#525252");
  });
});

describe("11.1 setColor", () => {
  const colors = frozen({ wall: "#ffcc00" });
  it("adds or replaces a colour, in lower case, without changing its argument", () => {
    expect(setColor(colors, "seat", "#3366FF")).toEqual({ wall: "#ffcc00", seat: "#3366ff" });
    expect(setColor(colors, "wall", "#000000")).toEqual({ wall: "#000000" });
    expect(colors).toEqual({ wall: "#ffcc00" });
  });
  it("removes a colour with null", () => {
    expect(setColor(colors, "wall", null)).toEqual({});
    expect(setColor(colors, "floor", null)).toEqual({ wall: "#ffcc00" });
  });
  it("ignores an invalid colour but still returns a new object", () => {
    const next = setColor(colors, "wall", "blue");
    expect(next).toEqual(colors);
    expect(next).not.toBe(colors);
  });
});

describe("11.1 normalizeColors", () => {
  const slots = ["wall", "floor", "seat"];
  it("keeps valid colours of known slots", () => {
    expect(normalizeColors({ wall: "#FFCC00", seat: "#3366ff", plant: "#00ff00", floor: "brown" }, slots)).toEqual({ wall: "#ffcc00", seat: "#3366ff" });
  });
  it("survives anything", () => {
    for (const junk of [null, undefined, "x", 3, [], { wall: 5 }]) expect(normalizeColors(junk, slots)).toEqual({});
  });
});
