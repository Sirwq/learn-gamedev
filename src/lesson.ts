import type { Box, CameraStart, World } from "./engine";

/** A Goal or Lose event: `test` runs every frame against the game objects and the seconds since the Run started. */
export type Check = { message: string; test: (world: World, time: number) => boolean };

export type Lesson = {
  title: string;
  /** Markdown. */
  explanation: string;
  level: { boxes: Box[]; width?: number; height?: number; camera?: CameraStart };
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

/** The Lose event most Levels share: the Player left the 960×540 screen. */
export const offScreen: Check = {
  message: "You fell off the screen. Press Run to try again.",
  test: (world) => {
    const p = find(world, "Player");
    return p.x + p.w < 0 || p.x > 960 || p.y + p.h < 0;
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
    for (const [name, { stub }] of Object.entries(scripts)) code[name] ??= store.getItem(codeKey(name)) ?? stub;
  return code;
}

// How many Hints the student has opened, per Lesson.
const hintsKey = (lesson: string) => `hints:${lesson}`;
export const openedHints = (lesson: string, store: Pick<Storage, "getItem"> = localStorage) =>
  Number(store.getItem(hintsKey(lesson))) || 0;
export const saveOpenedHints = (lesson: string, count: number, store: Pick<Storage, "setItem"> = localStorage) =>
  store.setItem(hintsKey(lesson), String(count));
