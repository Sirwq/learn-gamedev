import { describe, expect, it } from "vitest";
import { type Lesson, loadScripts, openedHints, saveOpenedHints, saveScript, splitHints } from "./lesson";

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const lessons: Pick<Lesson, "scripts">[] = [
  { scripts: { Player: { stub: "player stub", reference: "player 1" } } },
  { scripts: { Player: { stub: "player stub 2", reference: "player 2" }, Bullet: { stub: "bullet stub", reference: "bullet 2" } } },
];

describe("saved Scripts", () => {
  it("start from the stubs", () => {
    expect(loadScripts(lessons, 0, store())).toEqual({ Player: "player stub" });
  });
  it("restore the student's code after a reload", () => {
    const s = store();
    saveScript("Player", "my player", s);
    expect(loadScripts(lessons, 0, s)).toEqual({ Player: "my player" });
  });
  it("a new Lesson adds its Script's stub and leaves existing files alone", () => {
    const s = store();
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "player stub", Bullet: "bullet stub" });
    saveScript("Player", "my player", s);
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "my player", Bullet: "bullet stub" });
  });
});

describe("Hints", () => {
  it("split at their headings, keeping code blocks", () => {
    const md = "## Hint 1\n\nLook at `Update()`.\n\n## Hint 2\n\n```ts\n// ## Hint 3 is not a heading here\nx = 1;\n```\n";
    expect(splitHints(md)).toEqual(["Look at `Update()`.", "```ts\n// ## Hint 3 is not a heading here\nx = 1;\n```"]);
  });
  it("none without a hints.md", () => {
    expect(splitHints("")).toEqual([]);
  });
  it("opened ones are restored per Lesson", () => {
    const s = store();
    expect(openedHints("1. Move right", s)).toBe(0);
    saveOpenedHints("1. Move right", 2, s);
    expect(openedHints("1. Move right", s)).toBe(2);
    expect(openedHints("2. Speed", s)).toBe(0);
  });
});
