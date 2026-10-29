import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clear, get, keys, set, setMany } from "idb-keyval";
import { createProject, deleteProject, duplicateProject, exportFileName, exportProject, importProject, loadProjects, migrateProjects, playground, sandboxUnlocked, saveProject, scriptNameError, setDevUnlock } from "./sandbox";
import { isPassed, markPassed } from "./check";
import { loadScripts, saveScript } from "./lesson";
import { legacyAiNote } from "./lessons/ai-note";
import { course } from "./lessons/course";
import { api, keyEvent, KeyCode, releaseAllKeys, startGame, worldView } from "./engine";
import { loadScript, memoryStore } from "./test-helpers";


describe("Sandbox unlock", () => {
  it("stays secret until the last Lesson is passed", () => {
    const s = memoryStore();
    for (const l of course.slice(0, -1)) markPassed(l.title, s);
    expect(sandboxUnlocked(course, s)).toBe(false);
    markPassed(course[course.length - 1].title, s);
    expect(sandboxUnlocked(course, s)).toBe(true);
  });

  it("opens with the dev flag without passing any Lesson", () => {
    const s = memoryStore();
    setDevUnlock(true, s);
    expect(sandboxUnlocked(course, s)).toBe(true);
    expect(course.some((l) => isPassed(l.title, s))).toBe(false);
    setDevUnlock(false, s);
    expect(sandboxUnlocked(course, s)).toBe(false);
  });
});

vi.mock("idb-keyval", async (actual) => {
  const m = await actual<typeof import("idb-keyval")>();
  return { ...m, setMany: vi.fn(m.setMany) };
});

/** A store already migrated to IndexedDB. */
const migrated = async () => {
  const s = memoryStore();
  await migrateProjects(s);
  return s;
};

describe("Projects", () => {
  beforeEach(() => clear());

  it("are created, duplicated and deleted in IndexedDB, images and all", async () => {
    const s = await migrated();
    expect(await loadProjects(s)).toEqual([]);
    const blank = await createProject("blank", course, s);
    expect(blank.level.boxes).toEqual([expect.objectContaining({ tag: "Game", script: "Game", w: 0, h: 0 })]);
    expect(Object.keys(blank.scripts)).toEqual(["Game"]);
    await set(`image:${blank.id}:Player`, "png");
    await set(`image:${blank.id}:Player:top`, "top png");
    const copy = await duplicateProject(blank, s);
    expect(copy.id).not.toBe(blank.id);
    expect(await get(`image:${copy.id}:Player:top`)).toBe("top png");
    expect(await loadProjects(s).then((l) => l.map((p) => p.name))).toEqual(["Blank", "Blank copy"]);
    await saveProject({ ...copy, name: "Mine" }, s);
    expect(await loadProjects(s).then((l) => l.map((p) => p.name))).toEqual(["Blank", "Mine"]);
    await deleteProject(blank.id, s);
    expect(await loadProjects(s)).toEqual([{ ...copy, name: "Mine" }]);
    expect((await keys<string>()).filter((k) => k.includes(blank.id))).toEqual([]);
    expect(s.getItem("sandbox:projects")).toBeNull();
  });

  it("before the migration they stay in localStorage", async () => {
    const s = memoryStore();
    const blank = await createProject("blank", course, s);
    await duplicateProject(blank, s);
    await deleteProject(blank.id, s);
    expect(JSON.parse(s.getItem("sandbox:projects")!).map((p: { name: string }) => p.name)).toEqual(["Blank copy"]);
    expect(await keys()).toEqual([]);
  });

  it("the migration copies them, flags only after reading back, runs twice safely and keeps the old key", async () => {
    const s = memoryStore();
    const a = await createProject("blank", course, s);
    const b = await createProject("platformer", course, s);
    const old = s.getItem("sandbox:projects");
    await migrateProjects(s);
    expect(s.getItem("storage:v2")).toBe("1");
    expect(await loadProjects(s)).toEqual([a, b]);
    s.removeItem("storage:v2");
    await migrateProjects(s);
    expect(s.getItem("storage:v2")).toBe("1");
    expect(await loadProjects(s)).toEqual([a, b]);
    expect(s.getItem("sandbox:projects")).toBe(old);
  });

  it("a failed migration leaves the flag unset and Projects usable, and tries again next load", async () => {
    const s = memoryStore();
    const a = await createProject("blank", course, s);
    vi.mocked(setMany).mockRejectedValueOnce(new Error("no IndexedDB"));
    await migrateProjects(s);
    expect(s.getItem("storage:v2")).toBeNull();
    const b = await createProject("blank", course, s);
    expect(await loadProjects(s)).toEqual([a, b]);
    await migrateProjects(s);
    expect(s.getItem("storage:v2")).toBe("1");
    expect(await loadProjects(s)).toEqual([a, b]);
  });

  it("takes in Projects an old tab writes to localStorage after the migration, but not deleted ones", async () => {
    const s = memoryStore();
    const a = await createProject("blank", course, s);
    await migrateProjects(s);
    await deleteProject(a.id, s);
    const late = { ...a, id: "late", name: "From an old tab" };
    s.setItem("sandbox:projects", JSON.stringify([a, late]));
    expect(await loadProjects(s)).toEqual([late]);
  });

  it("My platformer copies the Course code once, and the two never touch again", async () => {
    const s = await migrated();
    saveScript("Player", "my course player", s);
    const p = await createProject("platformer", course, s);
    expect(p.scripts).toEqual(loadScripts(course, course.length - 1, s));
    expect(p.scripts.Player).toBe("my course player");
    saveScript("Player", "newer course player", s);
    expect((await loadProjects(s))[0].scripts.Player).toBe("my course player");
    await saveProject({ ...p, scripts: { ...p.scripts, Player: "sandbox player" } }, s);
    expect(loadScripts(course, course.length - 1, s).Player).toBe("newer course player");
  });

  it("saved Projects lose the old AI note comment on line 1", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    await saveProject({ ...p, scripts: { Game: `// ${legacyAiNote}\n\nclass Game {}` } }, s);
    expect((await loadProjects(s))[0].scripts.Game).toBe("class Game {}");
  });

  it("the playground uses every tag and is wider than the screen", () => {
    const tags = new Set(course.flatMap((l) => l.level.boxes.map((b) => b.tag)));
    expect(new Set(playground.boxes.map((b) => b.tag))).toEqual(tags);
    expect(Math.max(...playground.boxes.map((b) => b.x + b.w))).toBeGreaterThan(960);
  });
});

/** A PNG header for a w×h image: all the import reads. */
const png = (w: number, h: number) => {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  new DataView(bytes.buffer).setUint32(16, w);
  new DataView(bytes.buffer).setUint32(20, h);
  return new Blob([bytes], { type: "image/png" });
};
const bytesOf = async (b: unknown) => [...new Uint8Array(await (b as Blob).arrayBuffer())];

describe("Export / Import one Project", () => {
  beforeEach(() => clear());

  it("round-trips a Project with its images into a new id", async () => {
    const s = await migrated();
    const p = await createProject("platformer", course, s);
    await set(`image:${p.id}:Player`, png(32, 32));
    await set(`image:${p.id}:Ground:top`, png(256, 20));
    const file = await exportProject(p);
    expect(JSON.parse(file)).toMatchObject({ format: "learn-dev-project", version: 1, images: { Player: expect.stringMatching(/^data:image\/png;base64,/) } });
    const copy = await importProject(file, s);
    expect(copy.id).not.toBe(p.id);
    expect(copy).toEqual({ ...p, id: copy.id });
    expect(await bytesOf(await get(`image:${copy.id}:Ground:top`))).toEqual(await bytesOf(png(256, 20)));
    expect(await bytesOf(await get(`image:${copy.id}:Player`))).toEqual(await bytesOf(png(32, 32)));
    expect((await loadProjects(s)).map((x) => x.id)).toEqual([p.id, copy.id]);
  });

  it("refuses a bad file without writing anything", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    await set(`image:${p.id}:Player`, png(32, 32));
    const good = JSON.parse(await exportProject(p));
    await set(`image:${p.id}:Player`, png(257, 32));
    const big = JSON.parse(await exportProject(p));
    const before = await keys();
    const files = {
      "broken JSON": "{nope",
      "wrong format": JSON.stringify({ ...good, format: "something-else" }),
      "newer version": JSON.stringify({ ...good, version: 2 }),
      "oversized image": JSON.stringify(big),
      "not a PNG": JSON.stringify({ ...good, images: { Player: "data:text/html;base64,PGI+" } }),
      "bad box": JSON.stringify({ ...good, project: { ...good.project, level: { boxes: [{ tag: "Player" }] } } }),
      "bad Script name": JSON.stringify({ ...good, project: { ...good.project, scripts: { "../x": "" } } }),
    };
    for (const [why, text] of Object.entries(files)) await expect(importProject(text, s), why).rejects.toThrow(/^This file can't be opened: /);
    expect(await keys()).toEqual(before);
  });

  it("file names replace characters a file system doesn't allow", () => {
    expect(exportFileName("My platformer")).toBe("My platformer.learn-dev.json");
    expect(exportFileName('a/b\\c:d*e?"<>|')).toBe("a_b_c_d_e_____.learn-dev.json");
    expect(exportFileName("  ")).toBe("Project.learn-dev.json");
  });
});

describe("the playground", () => {
  it("runs the Course's Reference code without errors", () => {
    const latest: Record<string, string> = {};
    for (const l of course) for (const [name, { reference }] of Object.entries(l.scripts)) latest[name] = reference;
    const classes = Object.fromEntries(Object.entries(latest).map(([n, ts]) => [n, loadScript(ts, n)]));
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
