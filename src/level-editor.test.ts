import { describe, expect, it } from "vitest";
import { boxAt, handleAt, levelCode, levelEditor, moved, resized, sizeStep } from "./level-editor";
import { type Box, startGame } from "./engine";
import { playground } from "./sandbox";
import { loadScript } from "./test-helpers";

const box = (b: Partial<Box> = {}): Box => ({ tag: "Ground", x: 0, y: 0, w: 100, h: 40, color: "#5a3", ...b });

describe("snap", () => {
  it("moves onto the 20 px grid, or by whole pixels without snap (Alt)", () => {
    expect(moved(box(), 27, 11, true)).toMatchObject({ x: 20, y: 20 });
    expect(moved(box(), 27.4, 11.6, false)).toMatchObject({ x: 27, y: 12 });
  });
  it("resizes tiled tags in 20 px steps and sprite tags in 4 px steps", () => {
    expect(sizeStep("Platform")).toBe(20);
    expect(sizeStep("Coin")).toBe(4);
    expect(resized(box(), "e", 13, 0, true)).toMatchObject({ x: 0, w: 120 });
    expect(resized(box({ tag: "Coin", w: 24, h: 24 }), "ne", 5, 7, true)).toMatchObject({ w: 28, h: 32 });
    expect(resized(box({ tag: "Coin", w: 24, h: 24 }), "e", 5, 0, false)).toMatchObject({ w: 29 });
  });
  it("keeps the opposite edge put and never shrinks below one step", () => {
    expect(resized(box(), "sw", 40, -20, true)).toMatchObject({ x: 40, w: 60, y: -20, h: 60 });
    expect(resized(box(), "w", 500, 0, true)).toMatchObject({ x: 80, w: 20 });
    expect(resized(box(), "n", 0, -500, false)).toMatchObject({ y: 0, h: 1 });
  });
});

describe("hit-testing", () => {
  it("finds the topmost box under a world point, skipping zero-size boxes", () => {
    const boxes = [box(), box({ x: 50, w: 20, h: 60 }), box({ w: 0, h: 0 })];
    expect(boxAt(boxes, 60, 30)).toBe(1);
    expect(boxAt(boxes, 10, 10)).toBe(0);
    expect(boxAt(boxes, 0, 0)).toBe(0);
    expect(boxAt(boxes, 500, 10)).toBe(-1);
  });
  it("finds the handle near a point on the selected box's screen rect", () => {
    const r = { x: 100, y: 50, w: 80, h: 40 };
    expect(handleAt(r, 100, 50)).toBe("nw");
    expect(handleAt(r, 185, 92)).toBe("se");
    expect(handleAt(r, 140, 48)).toBe("n");
    expect(handleAt(r, 140, 70)).toBeUndefined();
  });
});

describe("undo stack", () => {
  it("keeps one step per change and redoes it", () => {
    const ed = levelEditor({ boxes: [box()] });
    ed.begin();
    ed.level.boxes[0] = moved(box(), 20, 0, true);
    ed.level.boxes[0] = moved(box(), 40, 0, true); // a drag passes many points: still one step
    expect(ed.commit()).toBe(true);
    expect(ed.edit((b) => b.splice(0, 1))).toBe(true);
    expect(ed.level.boxes).toEqual([]);
    expect(ed.undo()).toBe(true);
    expect(ed.level.boxes[0].x).toBe(40);
    expect(ed.undo()).toBe(true);
    expect(ed.level.boxes[0].x).toBe(0);
    expect(ed.undo()).toBe(false);
    expect(ed.redo() && ed.redo()).toBe(true);
    expect(ed.level.boxes).toEqual([]);
  });
  it("adds no step for a change that changed nothing, and a new change drops the redo steps", () => {
    const ed = levelEditor({ boxes: [box()] });
    expect(ed.edit(() => {})).toBe(false);
    expect(ed.canUndo()).toBe(false);
    ed.edit((b) => (b[0].x = 20));
    ed.undo();
    ed.edit((b) => (b[0].y = 20));
    expect(ed.canRedo()).toBe(false);
  });
  it("drops the selection when undo removes the selected box", () => {
    const ed = levelEditor({ boxes: [box()] });
    ed.edit((b) => b.push(box({ x: 200 })));
    ed.selected = 1;
    ed.undo();
    expect(ed.selected).toBe(-1);
  });
});

describe("edit vs Run", () => {
  it("refuses edits, undo and redo while running", () => {
    const ed = levelEditor({ boxes: [box()] });
    ed.edit((b) => (b[0].x = 20));
    ed.running = true;
    expect(ed.edit((b) => (b[0].x = 60))).toBe(false);
    expect(ed.begin()).toBe(false);
    expect(ed.undo()).toBe(false);
    expect(ed.level.boxes[0].x).toBe(20);
    ed.running = false;
    expect(ed.undo()).toBe(true);
  });
  it("keeps the editor boxes where they were after a Run that moved and spawned objects", () => {
    const ed = levelEditor(structuredClone(playground));
    const before = structuredClone(ed.level.boxes);
    const Spawner = loadScript(`class Spawner extends MonoBehaviour {
      Update() {
        this.transform.position = this.transform.position.Add(new Vector2(5, 0));
        Instantiate({ tag: "Coin", w: 24, h: 24, color: "gold" }, new Vector2(0, 300));
      }
    }`, "Spawner");
    ed.running = true;
    const game = startGame(ed.level.boxes.map((b) => (b.script ? { ...b, script: "Spawner" } : b)), { Spawner });
    for (let i = 0; i < 10; i++) game.step();
    expect(game.objects.length).toBeGreaterThan(before.length);
    ed.running = false;
    expect(ed.level.boxes).toEqual(before);
  });
});

describe("View Level as Code", () => {
  it("writes the boxes in the Lesson format, script only where set", () => {
    const code = levelCode([box({ tag: "Player", w: 32, h: 32, color: "orange", script: "Player" }), box()]);
    expect(code).toBe(`boxes: [
  { tag: "Player", x: 0, y: 0, w: 32, h: 32, color: "orange", script: "Player" },
  { tag: "Ground", x: 0, y: 0, w: 100, h: 40, color: "#5a3" },
],`);
  });
  it("reads back as the same boxes", () => {
    const code = levelCode(playground.boxes);
    expect(new Function(`return { ${code} }`)().boxes).toEqual(playground.boxes);
  });
});
