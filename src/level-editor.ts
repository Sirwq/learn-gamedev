// The Level editor's pure parts (spec 049): snapping, hit-testing, undo and the Level as code. The page side is level-view.ts.
import type { Box } from "./engine";
import type { Lesson } from "./lesson";

export type Level = Lesson["level"];
type Rect = { x: number; y: number; w: number; h: number };

/** World pixels per tile: positions snap to it. */
export const GRID = 20;
/** Tags drawn as 20 px tiles (sprites.ts): their size snaps to the grid too. */
export const TILED = ["Ground", "Platform", "Wall", "Water", "Spikes"];
/** Every tag with art, for the Tag dropdown next to the Level's own tags. */
export const ART_TAGS = ["Player", "Enemy", "Coin", "Flag", "Bullet", ...TILED];

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
export function resized(start: Box, handle: Handle, dx: number, dy: number, snap: boolean): Box {
  const step = snap ? sizeStep(start.tag) : 1;
  const size = (v: number) => Math.max(step, near(v, step));
  let { x, y, w, h } = start;
  if (handle.includes("e")) w = size(start.w + dx);
  if (handle.includes("w")) (w = size(start.w - dx), (x = start.x + start.w - w));
  if (handle.includes("n")) h = size(start.h + dy);
  if (handle.includes("s")) (h = size(start.h - dy), (y = start.y + start.h - h));
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

/** The editor's state: one undo step per committed change; nothing changes while a Run has the Level. */
export function levelEditor(level: Level) {
  const past: Box[][] = [];
  const future: Box[][] = [];
  let before: string | undefined;
  const put = (boxes: Box[]) => void level.boxes.splice(0, level.boxes.length, ...boxes);
  const ed = {
    level,
    running: false,
    selected: -1,
    /** Starts a change (like a drag); false while running. */
    begin() {
      if (ed.running) return false;
      before = JSON.stringify(level.boxes);
      return true;
    },
    /** Ends it: one undo step if the boxes changed. True if they did. */
    commit() {
      const was = before;
      before = undefined;
      if (was === undefined || was === JSON.stringify(level.boxes)) return false;
      past.push(JSON.parse(was));
      future.length = 0;
      return true;
    },
    /** A whole change in one go, like an inspector field. */
    edit(change: (boxes: Box[]) => void) {
      if (!ed.begin()) return false;
      change(level.boxes);
      return ed.commit();
    },
    undo: () => step(past, future),
    redo: () => step(future, past),
    canUndo: () => !ed.running && past.length > 0,
    canRedo: () => !ed.running && future.length > 0,
  };
  function step(from: Box[][], to: Box[][]) {
    if (ed.running || !from.length) return false;
    to.push(structuredClone(level.boxes));
    put(from.pop()!);
    if (ed.selected >= level.boxes.length) ed.selected = -1;
    return true;
  }
  return ed;
}

/** The `boxes` list as it would be written in a Lesson's `lesson.ts` (spec 004), one box per line. */
export function levelCode(boxes: Box[]) {
  const line = ({ tag, x, y, w, h, color, script }: Box) =>
    `  { tag: ${JSON.stringify(tag)}, x: ${x}, y: ${y}, w: ${w}, h: ${h}, color: ${JSON.stringify(color)}${script ? `, script: ${JSON.stringify(script)}` : ""} },`;
  return `boxes: [\n${boxes.map(line).join("\n")}\n],`;
}
