// The Level editor's pure parts (spec 049): snapping, hit-testing, undo and the Level as code. The page side is level-view.ts.
import type { Box, CameraStart } from "./engine";
import type { Lesson } from "./lesson";
import { imageName, type TagArt } from "./sprites";

export type Level = Lesson["level"];
type Rect = { x: number; y: number; w: number; h: number };

/** World pixels per tile: positions snap to it. */
export const GRID = 20;
/** Tags drawn as 20 px tiles (sprites.ts): their size snaps to the grid too. */
export const TILED = ["Ground", "Platform", "Wall", "Water", "Spikes"];
/** Every tag with art, for the Tag dropdown next to the Level's own tags. */
export const ART_TAGS = ["Player", "Enemy", "Coin", "Flag", "Bullet", "Box", ...TILED];

/** Tiled tags resize in whole tiles, sprite tags in 4 px steps. */
export const sizeStep = (tag: string) => (TILED.includes(tag) ? GRID : 4);

const near = (v: number, step: number) => Math.round(v / step) * step;

/** The box dragged by (dx, dy) world pixels from where the drag started; with snap its corner lands on the grid. */
export function moved(start: Box, dx: number, dy: number, snap: boolean): Box {
  const step = snap ? GRID : 1;
  return { ...start, x: near(start.x + dx, step), y: near(start.y + dy, step) };
}

/** One of the 8 resize handles: n is the top edge (y up), e the right one. */
export type Handle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
export const HANDLES: Handle[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

/** The box with this handle dragged by (dx, dy): the opposite edges stay put; with snap the size moves in its tag's steps. Never smaller than one step. */
export function resized(start: Box, handle: Handle, dx: number, dy: number, snap: boolean, proportional = false): Box {
  const step = snap ? sizeStep(start.tag) : 1;
  const size = (v: number) => Math.max(step, near(v, step));
  let { x, y, w, h } = start;
  if (handle.includes("e")) w = size(start.w + dx);
  if (handle.includes("w")) (w = size(start.w - dx), (x = start.x + start.w - w));
  if (handle.includes("n")) h = size(start.h + dy);
  if (handle.includes("s")) (h = size(start.h - dy), (y = start.y + start.h - h));
  if (proportional && start.w > 0 && start.h > 0) {
    const horizontal = handle.includes("e") || handle.includes("w");
    const vertical = handle.includes("n") || handle.includes("s");
    if (horizontal && (!vertical || Math.abs(w / start.w - 1) >= Math.abs(h / start.h - 1))) h = Math.max(1, Math.round(w * start.h / start.w));
    else w = Math.max(1, Math.round(h * start.w / start.h));
    x = handle.includes("w") ? start.x + start.w - w : horizontal ? start.x : start.x + (start.w - w) / 2;
    y = handle.includes("s") ? start.y + start.h - h : vertical ? start.y : start.y + (start.h - h) / 2;
  }
  return { ...start, x, y, w, h };
}

/** Index of the topmost box (drawn last) under the world point, or -1. */
export function boxAt(boxes: Rect[], x: number, y: number) {
  for (let i = boxes.length - 1; i >= 0; i--) {
    const b = boxes[i];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && b.w > 0 && b.h > 0) return i;
  }
  return -1;
}

/** Where each handle sits on a screen rect (top-left, y down). */
export function handlePoints(r: Rect): Record<Handle, [number, number]> {
  const [l, c, rt] = [r.x, r.x + r.w / 2, r.x + r.w];
  const [t, m, b] = [r.y, r.y + r.h / 2, r.y + r.h];
  return { n: [c, t], ne: [rt, t], e: [rt, m], se: [rt, b], s: [c, b], sw: [l, b], w: [l, m], nw: [l, t] };
}

/** The handle within `reach` screen pixels of the point on the selected box's screen rect, if any. */
export function handleAt(r: Rect, px: number, py: number, reach = 8): Handle | undefined {
  const points = handlePoints(r);
  return HANDLES.find((h) => Math.abs(points[h][0] - px) <= reach && Math.abs(points[h][1] - py) <= reach);
}

/** Same images under the same names. */
export const sameImages = (a: Record<string, Blob>, b: Record<string, Blob>) =>
  Object.keys({ ...a, ...b }).every((k) => a[k] === b[k]);

/** The editor's state: one undo step per committed change to the boxes, the tags' art or their own images (Blobs by imageName); nothing changes while a Run has the Level. */
export function levelEditor(level: Level, images: Record<string, Blob> = {}) {
  type Snap = { json: string; images: Record<string, Blob> };
  const past: Snap[] = [];
  const future: Snap[] = [];
  let before: Snap | undefined;
  const snap = (): Snap => ({ json: JSON.stringify({ boxes: level.boxes, art: level.art }), images: { ...images } });
  const put = (s: Snap) => {
    const { boxes, art } = JSON.parse(s.json);
    level.boxes.splice(0, level.boxes.length, ...boxes);
    if (art) level.art = art;
    else delete level.art;
    for (const k in images) delete images[k];
    Object.assign(images, s.images);
  };
  const ed = {
    level,
    images,
    running: false,
    selected: -1,
    /** Starts a change (like a drag); false while running. */
    begin() {
      if (ed.running) return false;
      before = snap();
      return true;
    },
    /** Ends it: one undo step if anything changed. True if it did. */
    commit() {
      const was = before;
      before = undefined;
      const now = snap();
      if (!was || (was.json === now.json && sameImages(was.images, now.images))) return false;
      past.push(was);
      future.length = 0;
      return true;
    },
    /** A whole change in one go, like an inspector field. */
    edit(change: (boxes: Box[]) => void) {
      if (!ed.begin()) return false;
      change(level.boxes);
      return ed.commit();
    },
    /** Sets or replaces a tag's own image (or its Top image); with no Blob removes it, and removing the main image resets the tag to its default art. */
    setImage: (tag: string, blob: Blob | undefined, top = false) => ed.edit(() => putImage(level, images, tag, blob, top)),
    /** Changes how a tag with an own image draws. */
    setArt: (tag: string, change: Partial<TagArt>) => ed.edit(() => (level.art![tag] = { ...level.art![tag], ...change })),
    undo: () => step(past, future),
    redo: () => step(future, past),
    canUndo: () => !ed.running && past.length > 0,
    canRedo: () => !ed.running && future.length > 0,
  };
  function step(from: Snap[], to: Snap[]) {
    if (ed.running || !from.length) return false;
    to.push(snap());
    put(from.pop()!);
    if (ed.selected >= level.boxes.length) ed.selected = -1;
    return true;
  }
  return ed;
}

/** setImage's change, for use inside a bigger edit. A tag's first image starts it in today's mode: built-in tiled tags tile, the rest stretch. */
export function putImage(level: Level, images: Record<string, Blob>, tag: string, blob: Blob | undefined, top = false) {
  if (blob) {
    images[imageName(tag, top)] = blob;
    level.art = { ...level.art, [tag]: level.art?.[tag] ?? { draw: TILED.includes(tag) ? "tile" : "stretch", pixel: true } };
    return;
  }
  delete images[imageName(tag, top)];
  if (top) return;
  delete images[imageName(tag, true)];
  const { [tag]: _, ...rest } = level.art ?? {};
  level.art = rest;
}

/** Match image shape: the box keeps its width and takes its height from the image's aspect ratio. */
export const matchShape = (b: Box, imageW: number, imageH: number): Box => ({ ...b, h: Math.max(1, Math.round((b.w * imageH) / imageW)) });

/** The `boxes` list as it would be written in a Lesson's `lesson.ts` (spec 004), one box per line. */
export function levelCode(boxes: Box[]) {
  const line = ({ tag, x, y, w, h, color, script }: Box) =>
    `  { tag: ${JSON.stringify(tag)}, x: ${x}, y: ${y}, w: ${w}, h: ${h}, color: ${JSON.stringify(color)}${script ? `, script: ${JSON.stringify(script)}` : ""} },`;
  return `boxes: [\n${boxes.map(line).join("\n")}\n],`;
}

// Moving around: the editor's view is a camera start { x, y, size }; 100 % zoom shows 540 world px top to bottom.
const ZOOM_MIN = 0.25, ZOOM_MAX = 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const zoomOf = (size: number) => 270 / size;

/** The view zoomed in by `factor` (clamped to 25 %–200 %), keeping the world point `at` where it is on screen. */
export function zoomed(view: CameraStart, factor: number, at: { x: number; y: number }): CameraStart {
  const size = 270 / clamp(zoomOf(view.size) * factor, ZOOM_MIN, ZOOM_MAX);
  const k = size / view.size;
  return { x: at.x + (view.x - at.x) * k, y: at.y + (view.y - at.y) * k, size };
}

/** The smallest bounds holding every box with a size, or undefined for none. */
export function bounds(boxes: Rect[]) {
  const shown = boxes.filter((b) => b.w > 0 && b.h > 0);
  if (!shown.length) return undefined;
  const x = Math.min(...shown.map((b) => b.x)), y = Math.min(...shown.map((b) => b.y));
  return { x, y, w: Math.max(...shown.map((b) => b.x + b.w)) - x, h: Math.max(...shown.map((b) => b.y + b.h)) - y };
}

/** Fit Level: the whole Level on a 16:9 view with a 10 % margin. */
export function fitView(boxes: Rect[]): CameraStart {
  const b = bounds(boxes);
  if (!b) return { x: 480, y: 270, size: 270 };
  const size = clamp(Math.max(b.h / 2, ((b.w / 2) * 9) / 16) * 1.1, 270 / ZOOM_MAX, 270 / ZOOM_MIN);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2, size };
}

/** "Set camera start here": the view in whole pixels. */
export const cameraStart = ({ x, y, size }: CameraStart): CameraStart => ({ x: Math.round(x), y: Math.round(y), size: Math.round(size) });

const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };

/** An arrow key on the selected box: moves it by 20 (Alt: 1); Shift resizes from the top-right corner in its size steps. Undefined for other keys. */
export function nudged(b: Box, key: string, shift: boolean, alt: boolean, snap: boolean, proportional = false): Box | undefined {
  const dir = ARROWS[key];
  if (!dir) return undefined;
  const free = alt || !snap;
  if (!shift) return moved(b, dir[0] * (alt ? 1 : GRID), dir[1] * (alt ? 1 : GRID), !free);
  const step = alt ? 1 : sizeStep(b.tag);
  return resized(b, dir[0] ? "e" : "n", dir[0] * step, dir[1] * step, !free, proportional);
}

/** A new box's size and colour per art tag, as the playground has them. */
const NEW: Record<string, Omit<Box, "tag" | "x" | "y">> = {
  Player: { w: 32, h: 32, color: "orange" }, Enemy: { w: 40, h: 40, color: "crimson" }, Coin: { w: 24, h: 24, color: "gold" },
  Flag: { w: 24, h: 64, color: "gold" }, Bullet: { w: 8, h: 4, color: "white" }, Box: { w: 40, h: 40, color: "#a86" }, Ground: { w: 200, h: 40, color: "#5a3" },
  Platform: { w: 120, h: 20, color: "#a86" }, Wall: { w: 40, h: 100, color: "#888" }, Water: { w: 200, h: 40, color: "#36c" },
  Spikes: { w: 80, h: 20, color: "#ccd" },
};

/** The palette: every art tag, then the Level's own tags in the colour of their first box. */
export function paletteTags(boxes: Box[]) {
  const own = new Map<string, string>();
  for (const b of boxes) if (!ART_TAGS.includes(b.tag) && b.w > 0 && b.h > 0 && !own.has(b.tag)) own.set(b.tag, b.color);
  return [...ART_TAGS.map((tag) => ({ tag, ...NEW[tag] })), ...[...own].map(([tag, color]) => ({ tag, w: 40, h: 40, color }))];
}

/** A palette tag dropped centred on the world point, on the grid. Player and Enemy get their Script when the Project has it. */
export function dropped(tag: string, at: { x: number; y: number }, scripts: string[], palette = paletteTags([])): Box {
  const { w, h, color } = palette.find((t) => t.tag === tag) ?? { w: 40, h: 40, color: "#888" };
  const b: Box = { tag, x: near(at.x - w / 2, GRID), y: near(at.y - h / 2, GRID), w, h, color };
  if ((tag === "Player" || tag === "Enemy") && scripts.includes(tag)) b.script = tag;
  return b;
}
