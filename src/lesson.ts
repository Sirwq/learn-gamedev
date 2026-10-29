import type { Box, CameraStart, World } from "./engine";

/** A Goal or Lose event: `test` runs every frame against the game objects. */
export type Check = { message: string; test: (world: World) => boolean };

export type Lesson = {
  title: string;
  /** Markdown. */
  explanation: string;
  level: { boxes: Box[]; width?: number; height?: number; camera?: CameraStart };
  goals: Check[];
  lose: Check[];
  /** Scripts this Lesson adds, by name: starter stub and Reference code. */
  scripts: Record<string, { stub: string; reference: string }>;
};

type Rect = { x: number; y: number; w: number; h: number };
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** The first object with this tag. */
export const find = (world: World, tag: string) => world.find((o) => o.tag === tag)!;

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
