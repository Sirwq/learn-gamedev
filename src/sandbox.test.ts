import { describe, expect, it } from "vitest";
import { createProject, deleteProject, duplicateProject, loadProjects, playground, sandboxUnlocked, saveProject, scriptNameError } from "./sandbox";
import { markPassed } from "./check";
import { loadScripts, saveScript } from "./lesson";
import { course } from "./lessons/course";
import { api, keyEvent, KeyCode, releaseAllKeys, scriptSource, startGame, worldView, type MonoBehaviour } from "./engine";
import { transpile } from "./run-utils";

const load = (ts: string, name: string) =>
  new Function(...Object.keys(api), scriptSource(transpile(ts), name).replace("export const __script =", "return"))(
    ...Object.values(api),
  ) as new () => MonoBehaviour;

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

describe("Sandbox unlock", () => {
  it("stays secret until the last Lesson is passed", () => {
    const s = store();
    for (const l of course.slice(0, -1)) markPassed(l.title, s);
    expect(sandboxUnlocked(course, s)).toBe(false);
    markPassed(course[course.length - 1].title, s);
    expect(sandboxUnlocked(course, s)).toBe(true);
  });
});

describe("Projects", () => {
  it("are created, duplicated and deleted in storage", () => {
    const s = store();
    expect(loadProjects(s)).toEqual([]);
    const blank = createProject("blank", course, s);
    expect(blank.level.boxes).toEqual([expect.objectContaining({ tag: "Game", script: "Game", w: 0, h: 0 })]);
    expect(Object.keys(blank.scripts)).toEqual(["Game"]);
    const copy = duplicateProject(blank, s);
    expect(copy.id).not.toBe(blank.id);
    expect(loadProjects(s).map((p) => p.name)).toEqual(["Blank", "Blank copy"]);
    saveProject({ ...copy, name: "Mine" }, s);
    expect(loadProjects(s).map((p) => p.name)).toEqual(["Blank", "Mine"]);
    deleteProject(blank.id, s);
    expect(loadProjects(s)).toEqual([{ ...copy, name: "Mine" }]);
  });

  it("My platformer copies the Course code once, and the two never touch again", () => {
    const s = store();
    saveScript("Player", "my course player", s);
    const p = createProject("platformer", course, s);
    expect(p.scripts).toEqual(loadScripts(course, course.length - 1, s));
    expect(p.scripts.Player).toBe("my course player");
    saveScript("Player", "newer course player", s);
    expect(loadProjects(s)[0].scripts.Player).toBe("my course player");
    saveProject({ ...p, scripts: { ...p.scripts, Player: "sandbox player" } }, s);
    expect(loadScripts(course, course.length - 1, s).Player).toBe("newer course player");
  });

  it("the playground uses every tag and is wider than the screen", () => {
    const tags = new Set(course.flatMap((l) => l.level.boxes.map((b) => b.tag)));
    expect(new Set(playground.boxes.map((b) => b.tag))).toEqual(tags);
    expect(Math.max(...playground.boxes.map((b) => b.x + b.w))).toBeGreaterThan(960);
  });
});

describe("the playground", () => {
  it("runs the Course's Reference code without errors", () => {
    const latest: Record<string, string> = {};
    for (const l of course) for (const [name, { reference }] of Object.entries(l.scripts)) latest[name] = reference;
    const classes = Object.fromEntries(Object.entries(latest).map(([n, ts]) => [n, load(ts, n)]));
    Object.assign(globalThis, api, classes);
    const game = startGame(playground.boxes, classes, playground.camera);
    keyEvent(KeyCode.RightArrow, true);
    for (let f = 0; f < 60; f++) game.step();
    releaseAllKeys();
    const p = worldView(game.objects).find((o) => o.tag === "Player")!;
    expect(p.x).toBeGreaterThan(300);
  });
});

describe("+ Script names", () => {
  it("must be a new class name that hides no API", () => {
    expect(scriptNameError("Coin", ["Game"])).toBe("");
    expect(scriptNameError("Game", ["Game"])).toMatch(/already/);
    expect(scriptNameError("coin", [])).toMatch(/capital/);
    expect(scriptNameError("My Coin", [])).toMatch(/capital/);
    expect(scriptNameError("Camera", [])).toMatch(/API/);
  });
});
