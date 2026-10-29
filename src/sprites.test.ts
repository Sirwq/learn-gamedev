import { describe, expect, it } from "vitest";
import { tiles } from "./sprites";

describe("tiles", () => {
  it("covers a box with whole tiles when it fits exactly", () => {
    expect(tiles({ x: 0, y: 0, w: 960, h: 48 }, 24)).toHaveLength(80);
  });
  it("cuts the right column and bottom row short, keeping the top row whole", () => {
    const t = tiles({ x: 10, y: 0, w: 60, h: 30 }, 24);
    expect(t).toHaveLength(6);
    expect(t[0]).toEqual({ x: 10, y: 6, w: 24, h: 24 });
    expect(t[2]).toEqual({ x: 58, y: 6, w: 12, h: 24 });
    expect(t[5]).toEqual({ x: 58, y: 0, w: 12, h: 6 });
  });
  it("makes one row the box's height when rows are that tall", () => {
    const t = tiles({ x: 0, y: 40, w: 80, h: 16 }, 20, 16);
    expect(t).toHaveLength(4);
    expect(t[3]).toEqual({ x: 60, y: 40, w: 20, h: 16 });
  });
});
