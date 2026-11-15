import { type Box, Camera, type CameraStart, type World } from "./engine";
import type { CheckWorld } from "./check";
import { withoutNoteComment } from "./lessons/ai-note";
import type { TagArt } from "./sprites";

/** A Goal or Lose event: `test` runs every frame against the game objects and the seconds since the Run started. */
export type Check = { message: string; test: (world: CheckWorld, time: number) => boolean };

export type Lesson = {
  title: string;
  /** The new idea it teaches, under its card on the Course menu. */
  concept: string;
  /** Markdown. */
  explanation: string;
  /** `art`: Sandbox only, how each tag with an own image draws (spec 050). */
  level: { boxes: Box[]; width?: number; height?: number; camera?: CameraStart; art?: Record<string, TagArt> };
  goals: Check[];
  lose: Check[];
  /** Scripts this Lesson adds, by name: starter stub and Reference code. */
  scripts: Record<string, { stub: string; reference: string }>;
  /** Markdown, from the Lesson's optional `hints.md`: each one closer to the answer. */
  hints?: string[];
};

/** Splits a `hints.md` at its `## Hint 1` / `## Hint 2` / `## Hint 3` headings. */
export const splitHints = (markdown: string) =>
  markdown.split(/^## Hint \d+[ \t]*$/m).slice(1).map((h) => h.trim());

type Rect = { x: number; y: number; w: number; h: number };
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** The first object with this tag. */
export const find = (world: World, tag: string) => world.find((o) => o.tag === tag)!;

/** The Lose event most Levels share: the Player left the camera's 16:9 view (960×540 until it moves), or fell below the Level. */
export const offScreen: Check = {
  message: "You fell off the screen. Press Run to try again.",
  test: (world) => {
    const p = find(world, "Player");
    const { orthographicSize: h, transform: { position: c } } = Camera.main;
    const w = (h * 16) / 9;
    return p.x + p.w < c.x - w || p.x > c.x + w || p.y + p.h < Math.max(0, c.y - h);
  },
};

// The student's code, one entry per Script: carried over between Lessons.
const codeKey = (script: string) => `code:${script}`;
export const saveScript = (script: string, code: string, store: Pick<Storage, "setItem"> = localStorage) =>
  store.setItem(codeKey(script), code);

/** Every Script up to this Lesson: the student's saved code, else the stub of the first Lesson that adds it. */
export function loadScripts(lessons: Pick<Lesson, "scripts">[], upTo: number, store: Pick<Storage, "getItem"> = localStorage) {
  const code: Record<string, string> = {};
  for (const { scripts } of lessons.slice(0, upTo + 1))
    for (const [name, { stub }] of Object.entries(scripts)) code[name] ??= withoutNoteComment(store.getItem(codeKey(name)) ?? stub);
  return code;
}

// How many Hints the student has opened, per Lesson.
const hintsKey = (lesson: string) => `hints:${lesson}`;
export const openedHints = (lesson: string, store: Pick<Storage, "getItem"> = localStorage) =>
  Number(store.getItem(hintsKey(lesson))) || 0;
export const saveOpenedHints = (lesson: string, count: number, store: Pick<Storage, "setItem"> = localStorage) =>
  store.setItem(hintsKey(lesson), String(count));

// Replay: the code at a Lesson's first pass, and the newer code put aside while a replay uses it.
const snapshotKey = (lesson: string) => `snapshot:${lesson}`;
const STASH = "code-before-replay";
export function saveSnapshot(lesson: string, code: Record<string, string>, store: Pick<Storage, "getItem" | "setItem"> = localStorage) {
  if (store.getItem(snapshotKey(lesson)) === null) store.setItem(snapshotKey(lesson), JSON.stringify(code));
}
/** Invalid snapshots are ignored without deleting the original stored value. */
export function parseSnapshot(text: string): Record<string, string> | null {
  try {
    const value: unknown = JSON.parse(text);
    return value !== null && typeof value === "object" && !Array.isArray(value) &&
      Object.entries(value).every(([name, code]) => /^[A-Z][A-Za-z0-9_]*$/.test(name) && typeof code === "string")
      ? value as Record<string, string> : null;
  } catch { return null; }
}
export const snapshot = (lesson: string, store: Pick<Storage, "getItem"> = localStorage) =>
  parseSnapshot(store.getItem(snapshotKey(lesson)) ?? "null");

/** "Load my code from when I passed it": the pass's code goes in, the newer code is put aside (never over code already put aside). */
export function loadSnapshot(lesson: string, store: Pick<Storage, "getItem" | "setItem"> = localStorage) {
  const old = snapshot(lesson, store) ?? {};
  const stash: Record<string, string | null> = JSON.parse(store.getItem(STASH) ?? "{}");
  for (const name in old) if (!(name in stash)) stash[name] = store.getItem(codeKey(name)); // null: never edited, back to the stub
  store.setItem(STASH, JSON.stringify(stash));
  for (const [name, code] of Object.entries(old)) saveScript(name, code, store);
}

/** Back on the current Lesson: the code a replay put aside returns. */
export function restoreStash(store: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage) {
  const stash: Record<string, string | null> | null = JSON.parse(store.getItem(STASH) ?? "null");
  if (!stash) return;
  for (const [name, code] of Object.entries(stash)) code === null ? store.removeItem(codeKey(name)) : saveScript(name, code, store);
  store.removeItem(STASH);
}
