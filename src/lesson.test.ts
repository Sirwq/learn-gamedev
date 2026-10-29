import { describe, expect, it } from "vitest";
import { type Lesson, loadScripts, loadSnapshot, openedHints, restoreStash, saveOpenedHints, saveScript, saveSnapshot, snapshot, splitHints } from "./lesson";
import { aiNote } from "./lessons/ai-note";
import { course } from "./lessons/course";
import { memoryStore } from "./test-helpers";

const lessons: Pick<Lesson, "scripts">[] = [
  { scripts: { Player: { stub: "player stub", reference: "player 1" } } },
  { scripts: { Player: { stub: "player stub 2", reference: "player 2" }, Bullet: { stub: "bullet stub", reference: "bullet 2" } } },
];

describe("saved Scripts", () => {
  it("start from the stubs", () => {
    expect(loadScripts(lessons, 0, memoryStore())).toEqual({ Player: "player stub" });
  });
  it("restore the student's code after a reload", () => {
    const s = memoryStore();
    saveScript("Player", "my player", s);
    expect(loadScripts(lessons, 0, s)).toEqual({ Player: "my player" });
  });
  it("a new Lesson adds its Script's stub and leaves existing files alone", () => {
    const s = memoryStore();
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "player stub", Bullet: "bullet stub" });
    saveScript("Player", "my player", s);
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "my player", Bullet: "bullet stub" });
  });
  it("lose the old AI note comment on line 1, and only an exact match of it", () => {
    const s = memoryStore();
    saveScript("Player", `// ${aiNote}\n\nclass Player {}`, s);
    saveScript("Bullet", `// ${aiNote} (mine)\n\nclass Bullet {}`, s);
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "class Player {}", Bullet: `// ${aiNote} (mine)\n\nclass Bullet {}` });
    saveScript("Player", `class Player {}\n// ${aiNote}\n`, s);
    expect(loadScripts(lessons, 1, s).Player).toBe(`class Player {}\n// ${aiNote}\n`);
  });
  it("Lesson stubs carry no AI note", () => {
    for (const l of course) for (const { stub } of Object.values(l.scripts)) expect(stub).not.toContain(aiNote);
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
    const s = memoryStore();
    expect(openedHints("1. Move right", s)).toBe(0);
    saveOpenedHints("1. Move right", 2, s);
    expect(openedHints("1. Move right", s)).toBe(2);
    expect(openedHints("2. Speed", s)).toBe(0);
  });
});

describe("replay", () => {
  it("keeps the code from a Lesson's first pass", () => {
    const s = memoryStore();
    expect(snapshot("1", s)).toBeNull();
    saveSnapshot("1", { Player: "player at pass" }, s);
    saveSnapshot("1", { Player: "later" }, s);
    expect(snapshot("1", s)).toEqual({ Player: "player at pass" });
  });
  it("loads the code from a pass, and the newer code returns on going back", () => {
    const s = memoryStore();
    saveSnapshot("1", { Player: "player 1" }, s);
    saveSnapshot("2", { Player: "player 2", Bullet: "bullet 2" }, s);
    saveScript("Player", "newest player", s); // Bullet never edited: still the stub
    loadSnapshot("1", s);
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "player 1", Bullet: "bullet stub" });
    loadSnapshot("2", s); // a second replay doesn't put the older code aside over the newest
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "player 2", Bullet: "bullet 2" });
    restoreStash(s);
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "newest player", Bullet: "bullet stub" });
    restoreStash(s); // nothing put aside any more
    expect(loadScripts(lessons, 1, s)).toEqual({ Player: "newest player", Bullet: "bullet stub" });
  });
});
