import { describe, expect, it } from "vitest";
import { swipeStep } from "./swipe";

describe("swipeStep", () => {
  it("swiping left moves to the next card, right to the previous", () => {
    expect(swipeStep(-80, 10)).toBe(1);
    expect(swipeStep(80, -10)).toBe(-1);
  });
  it("ignores taps and mostly vertical drags", () => {
    expect(swipeStep(-20, 0)).toBe(0);
    expect(swipeStep(-60, 90)).toBe(0);
  });
});
