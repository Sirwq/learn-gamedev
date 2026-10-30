import { describe, expect, it } from "vitest";
import { ART_TAGS, boxAt, matchShape, cameraStart, dropped, fitView, handleAt, levelCode, levelEditor, moved, nudged, paletteTags, resized, sizeStep, zoomed, zoomOf } from "./level-editor";
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
  it("keeps the starting shape when proportional resizing is requested", () => {
    expect(resized(box(), "ne", 20, 0, true, true)).toMatchObject({ x: 0, y: 0, w: 120, h: 48 });
    expect(resized(box(), "sw", -20, 0, true, true)).toMatchObject({ x: -20, y: -8, w: 120, h: 48 });
    expect(resized(box(), "n", 0, 20, false, true)).toMatchObject({ x: -25, y: 0, w: 150, h: 60 });
    expect(resized(box(), "e", 20, 0, false, true)).toMatchObject({ x: 0, y: -4, w: 120, h: 48 });
    expect(resized(box(), "e", -500, 0, true, true)).toMatchObject({ w: 20, h: 8 });
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

describe("own sprites", () => {
  const png = (n: string) => new Blob([n], { type: "image/png" });
  it("Match image shape keeps the width and sets the height from the image", () => {
    expect(matchShape(box({ w: 40, h: 40 }), 32, 64)).toMatchObject({ w: 40, h: 80 });
    expect(matchShape(box({ w: 30, h: 40 }), 256, 150)).toMatchObject({ w: 30, h: 18 });
  });
  it("setting an image starts a built-in tag in today's mode and a new tag stretched; Reset brings the default back", () => {
    const ed = levelEditor({ boxes: [box()] });
    expect(ed.setImage("Ground", png("a"))).toBe(true);
    expect(ed.setImage("Ground", png("t"), true)).toBe(true);
    expect(ed.setImage("Lava", png("l"))).toBe(true);
    expect(ed.level.art).toEqual({ Ground: { draw: "tile", pixel: true }, Lava: { draw: "stretch", pixel: true } });
    expect(Object.keys(ed.images)).toEqual(["Ground", "Ground:top", "Lava"]);
    expect(ed.setImage("Ground", undefined)).toBe(true);
    expect(ed.level.art).toEqual({ Lava: { draw: "stretch", pixel: true } });
    expect(Object.keys(ed.images)).toEqual(["Lava"]);
  });
  it("every image change is one undo step", () => {
    const a = png("a"), b = png("b");
    const ed = levelEditor({ boxes: [box()] }, { Coin: a });
    ed.level.art = { Coin: { draw: "stretch", pixel: true } };
    ed.setImage("Coin", b);
    ed.setArt("Coin", { pixel: false });
    expect(ed.undo()).toBe(true);
    expect(ed.level.art!.Coin.pixel).toBe(true);
    expect(ed.undo()).toBe(true);
    expect(ed.images.Coin).toBe(a);
    expect(ed.redo()).toBe(true);
    expect(ed.images.Coin).toBe(b);
    expect(ed.setImage("Coin", b)).toBe(false); // the same image again changes nothing
  });
  it("keys a tag's image by its escaped name, so any tag name fits", () => {
    const ed = levelEditor({ boxes: [box()] });
    ed.setImage("Big tree:top", png("x"), true);
    expect(Object.keys(ed.images)).toEqual(["Big%20tree%3Atop:top"]);
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

describe("moving around", () => {
  it("zooms 25 %–200 %, keeping the world point under the cursor still", () => {
    expect(zoomOf(270)).toBe(1);
    expect(zoomed({ x: 0, y: 0, size: 270 }, 100, { x: 0, y: 0 })).toEqual({ x: 0, y: 0, size: 135 });
    expect(zoomed({ x: 0, y: 0, size: 270 }, 1 / 100, { x: 0, y: 0 }).size).toBe(1080);
    expect(zoomed({ x: 0, y: 0, size: 270 }, 2, { x: 100, y: 0 })).toEqual({ x: 50, y: 0, size: 135 });
  });
  it("fits the Level's boxes, skipping zero-size ones", () => {
    const v = fitView([box({ x: 0, y: 0, w: 960, h: 40 }), box({ x: 5000, w: 0, h: 0 })]);
    expect(v).toMatchObject({ x: 480, y: 20 });
    expect(v.size).toBeCloseTo(270 * 1.1);
    expect(fitView([])).toEqual({ x: 480, y: 270, size: 270 });
  });
  it("saves the view as the camera start in whole pixels", () => {
    expect(cameraStart({ x: 10.4, y: 20.6, size: 300.2 })).toEqual({ x: 10, y: 21, size: 300 });
  });
});

describe("keyboard", () => {
  const keys = (b: Box, key: string, mods: { shift?: boolean; alt?: boolean } = {}, snap = true) => nudged(b, key, !!mods.shift, !!mods.alt, snap);
  it("moves by 20 onto the grid, or by 1 with Alt", () => {
    expect(keys(box({ x: 3 }), "ArrowRight")).toMatchObject({ x: 20 });
    expect(keys(box(), "ArrowDown")).toMatchObject({ y: -20 });
    expect(keys(box({ x: 3 }), "ArrowLeft", { alt: true })).toMatchObject({ x: 2 });
    expect(keys(box({ x: 3 }), "ArrowRight", {}, false)).toMatchObject({ x: 23 });
  });
  it("resizes with Shift in the tag's size steps, never below one step", () => {
    expect(keys(box(), "ArrowRight", { shift: true })).toMatchObject({ x: 0, w: 120 });
    expect(keys(box(), "ArrowUp", { shift: true })).toMatchObject({ y: 0, h: 60 });
    expect(keys(box({ tag: "Coin", w: 24 }), "ArrowLeft", { shift: true })).toMatchObject({ w: 20 });
    expect(keys(box(), "ArrowDown", { shift: true, alt: true })).toMatchObject({ h: 39 });
    expect(keys(box({ h: 20 }), "ArrowDown", { shift: true })).toMatchObject({ h: 20 });
  });
  it("keeps the shape with Ctrl/Command and Shift arrows", () => {
    expect(nudged(box(), "ArrowRight", true, false, true, true)).toMatchObject({ w: 120, h: 48 });
    expect(nudged(box(), "ArrowUp", true, false, true, true)).toMatchObject({ w: 150, h: 60 });
  });
  it("ignores other keys", () => expect(nudged(box(), "a", false, false, true)).toBeUndefined());
});

describe("palette", () => {
  it("drops a tag centred on the point, on the grid, with Player and Enemy's Script", () => {
    expect(dropped("Coin", { x: 480, y: 270 }, ["Player"])).toEqual({ tag: "Coin", x: 460, y: 260, w: 24, h: 24, color: "gold" });
    expect(dropped("Player", { x: 0, y: 0 }, ["Player"])).toMatchObject({ script: "Player", w: 32 });
    expect(dropped("Enemy", { x: 0, y: 0 }, ["Player"])).not.toHaveProperty("script");
  });
  it("lists the art tags, then the Level's own tags with their colour", () => {
    const tags = paletteTags([box({ tag: "Lava", color: "red" }), box({ tag: "Lava", color: "blue" })]);
    expect(tags.map((t) => t.tag)).toEqual([...ART_TAGS, "Lava"]);
    expect(tags.at(-1)).toMatchObject({ color: "red" });
    expect(dropped("Lava", { x: 0, y: 0 }, [], tags)).toMatchObject({ tag: "Lava", color: "red", w: 40, h: 40 });
  });
});
