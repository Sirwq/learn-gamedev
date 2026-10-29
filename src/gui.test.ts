import { describe, expect, it, vi } from "vitest";
import type { Label, TextAnchor } from "./engine";
import { layout, textList } from "./gui";

const label = (anchor: TextAnchor, text = "abcd"): Label =>
  ({ x: 100, y: 50, w: 200, h: 100, text, color: "rgb(255, 255, 255)", size: 32, anchor, outline: true });
const at = (anchor: TextAnchor, text?: string) => layout(label(anchor, text), (s) => s.length * 10).map(({ x, y }) => [x, y]);

describe("layout", () => {
  it("places the text inside its Rect by each of the 9 TextAnchors", () => {
    // 4 characters are 40 wide; one line of size 32 is 24 high
    expect(at("UpperLeft")).toEqual([[100, 50]]);
    expect(at("UpperCenter")).toEqual([[180, 50]]);
    expect(at("UpperRight")).toEqual([[260, 50]]);
    expect(at("MiddleLeft")).toEqual([[100, 88]]);
    expect(at("MiddleCenter")).toEqual([[180, 88]]);
    expect(at("MiddleRight")).toEqual([[260, 88]]);
    expect(at("LowerLeft")).toEqual([[100, 126]]);
    expect(at("LowerCenter")).toEqual([[180, 126]]);
    expect(at("LowerRight")).toEqual([[260, 126]]);
  });
  it("starts a new line at \\n, aligning each line on its own, and never wraps or clips", () => {
    expect(at("LowerRight", "ab\nabcd")).toEqual([[280, 102], [260, 126]]);
    expect(at("UpperLeft", "x".repeat(50))).toEqual([[100, 50]]);
  });
});

describe("textList", () => {
  it("shows the texts only when they change", () => {
    const show = vi.fn();
    const update = textList(show);
    update([]);
    expect(show).not.toHaveBeenCalled();
    update([{ text: "Coins: 1" }]);
    update([{ text: "Coins: 1" }]);
    expect(show).toHaveBeenCalledTimes(1);
    update([{ text: "Coins: 2" }]);
    expect(show).toHaveBeenLastCalledWith(["Coins: 2"]);
    update([]);
    expect(show).toHaveBeenLastCalledWith([]);
    expect(show).toHaveBeenCalledTimes(3);
  });
});
