import "fake-indexeddb/auto";
import ts from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clear, get, keys, set, setMany } from "idb-keyval";
import { addScript, playground, sandboxUnlocked, scriptNameError, scriptStub, setDevUnlock, type Project } from "./sandbox";
import { createProject, deleteProject, duplicateProject, exportProject, importProject, loadImageBlobs, loadProject, loadProjects, migrateProjects, saveProject, saveProjectWithImages } from "./project-storage";
import { exportFileName, checkProjectFile, encodeProjectFile } from "./project-file";
import { isPassed, markPassed } from "./check";
import { loadScripts, saveScript } from "./lesson";
import { legacyAiNote } from "./lessons/ai-note";
import { course } from "./lessons/course";
import { api, keyEvent, KeyCode, labels, releaseAllKeys, startGame, takeSounds, worldView } from "./engine";
import { loadScript, memoryStore } from "./test-helpers";
import engineApi from "./engine-api.d.ts?raw";
import { sandboxEmptyMessage } from "./menu";


describe("Sandbox unlock", () => {
  it("stays secret until Lesson 15 is passed", () => {
    const s = memoryStore();
    for (const l of course.slice(0, 14)) markPassed(l.title, s);
    expect(sandboxUnlocked(course, s)).toBe(false);
    markPassed(course[14].title, s);
    expect(sandboxUnlocked(course, s)).toBe(true);
  });

  it("still opens at Lesson 15 after Chapter 2 Lessons are appended", () => {
    const s = memoryStore();
    const extended = [...course, { title: "16. Sounds" }];
    markPassed(course[14].title, s);
    expect(sandboxUnlocked(extended, s)).toBe(true);
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

  it("creates an ordinary Sandbox tour whose Scripts type-check and Run", async () => {
    const s = await migrated();
    const project = await createProject("tour", course, s);
    expect(project.name).toBe("Example: Sandbox tour");
    expect(Object.keys(project.scripts)).toEqual(["Player", "HUD"]);
    expect(project.level.boxes.some((box) => box.tag === "Friend" && !project.level.art?.Friend)).toBe(true);
    const files: Record<string, string> = { "/api.d.ts": engineApi, ...Object.fromEntries(Object.entries(project.scripts).map(([name, code]) => [`/${name}.ts`, code])) };
    const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, lib: ["lib.es2022.d.ts"], types: [] };
    const host = ts.createCompilerHost(options);
    const read = host.getSourceFile;
    host.getSourceFile = (name, lang) => name in files ? ts.createSourceFile(name, files[name], lang) : read.call(host, name, lang);
    expect(ts.getPreEmitDiagnostics(ts.createProgram(Object.keys(files), options, host)).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))).toEqual([]);
    const classes = Object.fromEntries(Object.entries(project.scripts).map(([name, code]) => [name, loadScript(code, name)]));
    const game = startGame(project.level.boxes, classes);
    const played = new Set<string>();
    keyEvent(KeyCode.RightArrow, true);
    for (let frame = 0; frame < 90; frame++) {
      if (frame === 20) keyEvent(KeyCode.Space, true);
      if (frame === 21) keyEvent(KeyCode.Space, false);
      expect(() => game.step()).not.toThrow();
      for (const clip of takeSounds()) played.add(clip);
    }
    releaseAllKeys();
    expect([...played]).toEqual(expect.arrayContaining(["Jump", "Coin"]));
    expect(labels.some((label) => label.text.startsWith("Coins: "))).toBe(true);
    expect(worldView(game.objects).filter((box) => box.tag === "Coin").length).toBeLessThan(3);
    expect(await loadProjects(s)).toEqual([project]);
    project.scripts.Player = "changed in this Project";
    expect((await createProject("tour", course, s)).scripts.Player).not.toBe("changed in this Project");
  });

  it("shows the Sandbox suggestion only when there are no Projects", () => {
    expect(sandboxEmptyMessage(0)).toBe("New here? Try Example: Sandbox tour, or carry on with Chapter 2 in the Course.");
    expect(sandboxEmptyMessage(1)).toBe("");
  });

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

  it("save their own images: new and replaced ones written, dropped ones deleted; Duplicate copies them", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    await saveProjectWithImages(p, { Coin: new Blob(["a"]), "Big%20tree": new Blob(["b"]) }, s);
    await saveProjectWithImages(p, { Coin: new Blob(["c"]) }, s);
    const mine = (await loadProject(p.id, s))!.images;
    expect(Object.keys(mine)).toEqual(["Coin"]);
    expect(await mine.Coin.text()).toBe("c");
    const copy = await duplicateProject(p, s);
    expect(await (await loadImageBlobs(copy.id)).Coin.text()).toBe("c");
  });

  it("keeps the prior Project and images if a complete save fails", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    await saveProjectWithImages(p, { Game: png(8, 8) }, s);
    await expect(saveProjectWithImages({ ...p, name: "Changed" }, { Game: Symbol("bad") as unknown as Blob }, s)).rejects.toThrow();
    const after = (await loadProject(p.id, s))!;
    expect(after.project.name).toBe("Blank");
    expect(await bytesOf(after.images.Game)).toEqual(await bytesOf(png(8, 8)));
  });

  it("keeps rapid Project and image edits in request order", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    p.name = "First";
    const first = saveProjectWithImages(p, { Game: png(8, 8) }, s);
    p.name = "Second";
    const second = saveProject(p, s);
    p.name = "Final";
    const third = saveProjectWithImages(p, {}, s);
    await Promise.all([first, second, third]);
    const saved = (await loadProject(p.id, s))!;
    expect(saved.project.name).toBe("Final");
    expect(saved.images).toEqual({});
  });

  it("copies the latest images after a pending save and continues after a failed save", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    const failed = saveProjectWithImages(p, { Game: Symbol("bad") as unknown as Blob }, s);
    const saved = saveProjectWithImages(p, { Game: png(8, 8) }, s);
    const copy = duplicateProject(p, s);
    const file = exportProject(p);
    await expect(failed).rejects.toThrow();
    await saved;
    expect(await bytesOf((await loadProject((await copy).id, s))!.images.Game)).toEqual(await bytesOf(png(8, 8)));
    expect(checkProjectFile(JSON.parse(await file)).pngs).toHaveLength(1);
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

  it("starts a final project with Chapter 1 scripts without introducing later HUD code", async () => {
    const store = await migrated();
    saveScript("Player", "my final course player", store);
    const project = await createProject("platformer", course.slice(0, 15), store);
    expect(Object.keys(project.scripts).sort()).toEqual(["Bullet", "Enemy", "MovingPlatform", "Player"]);
    expect(project.scripts.Player).toBe("my final course player");
    expect((await loadProject(project.id, store))?.project.scripts).toEqual(project.scripts);
    expect(loadScripts(course, 14, store).Player).toBe("my final course player");
  });

  it("saved Projects lose the old AI note comment on line 1", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    await saveProject({ ...p, scripts: { Game: `// ${legacyAiNote}\n\nclass Game {}` } }, s);
    expect((await loadProjects(s))[0].scripts.Game).toBe("class Game {}");
  });

  it("the playground uses every visible Course tag and is wider than the screen", () => {
    const tags = new Set(course.flatMap((l) => l.level.boxes.map((b) => b.tag)).filter((tag) => tag !== "HUD"));
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
    expect(JSON.parse(file)).toMatchObject({ format: "learn-dev-project", version: 2, images: { Player: expect.stringMatching(/^data:image\/png;base64,/) } });
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
      "newer version": JSON.stringify({ ...good, version: 3 }),
      "oversized image": JSON.stringify(big),
      "not a PNG": JSON.stringify({ ...good, images: { Player: "data:text/html;base64,PGI+" } }),
      "bad box": JSON.stringify({ ...good, project: { ...good.project, level: { boxes: [{ tag: "Player" }] } } }),
      "bad art": JSON.stringify({ ...good, project: { ...good.project, level: { ...good.project.level, art: { Coin: { draw: "wobble", pixel: true } } } } }),
      "bad image name": JSON.stringify({ ...good, images: { "a/b": good.images.Player } }),
      "bad Script name": JSON.stringify({ ...good, project: { ...good.project, scripts: { "../x": "" } } }),
    };
    for (const [why, text] of Object.entries(files)) await expect(importProject(text, s), why).rejects.toThrow(/^This file can't be opened: /);
    expect(await keys()).toEqual(before);
  });

  it("carries each tag's Draw and Pixel art settings, and images of tags with any name", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    p.level.art = { "Big tree": { draw: "tile", pixel: false } };
    await saveProject(p, s);
    await set(`image:${p.id}:Big%20tree:top`, png(20, 20));
    const copy = await importProject(await exportProject(p), s);
    expect(copy.level.art).toEqual(p.level.art);
    expect(Object.keys(await loadImageBlobs(copy.id))).toEqual(["Big%20tree:top"]);
  });

  it("validates and encodes a file without storage", async () => {
    const project = { name: "Test", scripts: { Game: "class Game {}" }, level: { boxes: [] } };
    const image = png(16, 16);
    const file = await encodeProjectFile(project, { Game: image });
    const checked = checkProjectFile(file);
    expect(checked.project).toEqual(project);
    expect(await bytesOf(checked.pngs[0][1])).toEqual(await bytesOf(image));
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

describe("addScript", () => {
  it("adds a Start() / Update() stub under a valid name, or says what is wrong", () => {
    const p = { scripts: { Game: "" } } as unknown as Project;
    expect(addScript(p, "Coin")).toBe("");
    expect(p.scripts.Coin).toBe(scriptStub("Coin"));
    expect(p.scripts.Coin).toMatch(/Start\(\)[\s\S]*Update\(\)/);
    expect(addScript(p, "Coin")).toMatch(/already/);
    expect(addScript(p, "coin")).toMatch(/capital/);
    expect(Object.keys(p.scripts)).toEqual(["Game", "Coin"]);
  });
});

it("preserves opt-in contacts through save, reload, duplicate and versioned export; rejects invalid imports safely", async () => {
  await clear();
  const s = await migrated();
  const p = await createProject("blank", course, s);
  p.level.boxes[0].collider = true;
  await saveProject(p, s);
  expect((await loadProject(p.id, s))!.project.level.boxes[0].collider).toBe(true);
  expect((await duplicateProject(p, s)).level.boxes[0].collider).toBe(true);
  const file = JSON.parse(await exportProject(p));
  expect(file.version).toBe(2);
  expect((await importProject(JSON.stringify(file), s)).level.boxes[0].collider).toBe(true);
  const before = await loadProjects(s);
  for (const collider of ["true", 1, null, {}]) {
    const invalid = structuredClone(file);
    invalid.project.level.boxes[0].collider = collider;
    await expect(importProject(JSON.stringify(invalid), s)).rejects.toThrow();
  }
  for (const version of [0, -1, 1.5, 3]) await expect(importProject(JSON.stringify({ ...file, version }), s)).rejects.toThrow();
  expect(await loadProjects(s)).toEqual(before);
  delete file.project.level.boxes[0].collider;
  file.version = 1;
  const legacy = await importProject(JSON.stringify(file), s);
  expect(legacy.level.boxes[0].collider).toBeUndefined();
});
