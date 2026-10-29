import type { Box, World } from "./engine";

/** A Goal or Lose event: `test` runs every frame against the game objects. */
export type Check = { message: string; test: (world: World) => boolean };

export type Lesson = {
  title: string;
  /** Markdown. */
  explanation: string;
  level: { boxes: Box[]; width?: number; height?: number };
  goals: Check[];
  lose: Check[];
  /** Scripts this Lesson adds, by name: starter stub and Reference code. */
  scripts: Record<string, { stub: string; reference: string }>;
};

type Rect = { x: number; y: number; w: number; h: number };
export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** The first object with this tag. */
export const find = (world: World, tag: string) => world.find((o) => o.tag === tag)!;
