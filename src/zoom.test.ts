import { describe, expect, it } from "vitest";
import { FONT_DEFAULT, FONT_MAX, FONT_MIN, savedFontSize, zoom, zoomPercent } from "./zoom";

describe("zoom", () => {
  it("steps by 2 px and stops at the limits", () => {
    expect(zoom(14, 1)).toBe(16);
    expect(zoom(14, -1)).toBe(12);
    expect(zoom(FONT_MIN, -1)).toBe(FONT_MIN);
    expect(zoom(FONT_MAX, 1)).toBe(FONT_MAX);
  });
  it("resets to the default", () => expect(zoom(22, 0)).toBe(FONT_DEFAULT));
  it("shows the size as a percent of the default", () => {
    expect(zoomPercent(14)).toBe("100%");
    expect(zoomPercent(28)).toBe("200%");
  });
});

describe("savedFontSize", () => {
  it("restores a saved size", () => expect(savedFontSize("20")).toBe(20));
  it("falls back to the default when missing or out of range", () => {
    for (const raw of [null, "", "abc", "100", "3", "14.5"]) expect(savedFontSize(raw)).toBe(FONT_DEFAULT);
  });
});
