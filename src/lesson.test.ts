import { describe, expect, it } from "vitest";
import { type Lesson, loadScripts, saveScript } from "./lesson";

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
