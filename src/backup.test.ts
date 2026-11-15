import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { clear } from "idb-keyval";
import { backupFileName, backupReminder, exportEverything, planImport, snoozeReminder } from "./backup";
import { isPassed, markPassed } from "./check";
import { saveEarned, loadEarned } from "./achievements";
import { saveOpenedHints, saveScript, saveSnapshot } from "./lesson";
import { createProject, exportProject, loadProject, loadProjects, migrateProjects, saveProject, saveProjectWithImages } from "./project-storage";
import { course } from "./lessons/course";
import { memoryStore } from "./test-helpers";

const [l1, l2, l3] = course;
const DAY = 864e5;
const migrated = async () => {
  const s = memoryStore();
  await migrateProjects(s);
  return s;
};

describe("Export everything", () => {
  beforeEach(() => clear());

  it("holds Course progress and every Project, never the dev unlock", async () => {
    const s = await migrated();
    markPassed(l1.title, s);
    saveScript("Player", "// mine", s);
    saveEarned("jump", s);
    s.setItem("theme", "light");
    s.setItem("dev:sandbox-unlocked", "1");
    const p = await createProject("blank", course, s);
    const file = JSON.parse(await exportEverything(course, s));
    expect(file).toMatchObject({ format: "learn-dev-backup", version: 1, projects: [{ id: p.id, format: "learn-dev-project", project: { name: "Blank" } }] });
    expect(file.progress).toEqual({ [`passed:${l1.title}`]: "1", "code:Player": "// mine", "achievement:jump": "1", theme: "light" });
  });

  it("is named by the day", () => {
    expect(backupFileName(new Date(2026, 0, 5))).toBe("learn-dev-backup-2026-01-05.json");
  });
});

describe("Import everything", () => {
  beforeEach(() => clear());

  it("restores progress while keeping conflicting browser code by default", async () => {
    const from = memoryStore();
    for (const l of [l1, l2, l3]) markPassed(l.title, from);
    saveOpenedHints(l1.title, 3, from);
    saveOpenedHints(l3.title, 2, from);
    saveSnapshot(l3.title, { Player: "// l3" }, from);
    saveScript("Player", "// file", from);
    const file = await exportEverything(course, from);

    const to = memoryStore();
    markPassed(l1.title, to);
    saveOpenedHints(l1.title, 1, to);
    saveScript("Player", "// browser", to);
    const plan = await planImport(file, course, to);
    expect(plan.summary).toBe("Adds 2 Lessons passed, saved lesson work. Nothing here is overwritten.");
    expect(isPassed(l2.title, to)).toBe(false); // nothing written before Import
    await plan.apply();
    expect([l1, l2, l3].map((l) => isPassed(l.title, to))).toEqual([true, true, true]);
    expect(to.getItem(`hints:${l1.title}`)).toBe("1");
    expect(to.getItem(`hints:${l3.title}`)).toBe("2");
    expect(to.getItem(`snapshot:${l3.title}`)).toBe(JSON.stringify({ Player: "// l3" }));
    expect(to.getItem("code:Player")).toBe("// browser");
    expect(plan.codeConflicts).toEqual(["Player"]);
    await plan.apply(true);
    expect(to.getItem("code:Player")).toBe("// file");
  });

  it("keeps the browser's code when the file is not further along", async () => {
    const from = memoryStore();
    markPassed(l1.title, from);
    saveScript("Player", "// file", from);
    const to = memoryStore();
    markPassed(l1.title, to);
    saveScript("Player", "// browser", to);
    const plan = await planImport(await exportEverything(course, from), course, to);
    expect(plan.summary).toBe("Everything in this file is already here. Nothing changes.");
    await plan.apply();
    expect(to.getItem("code:Player")).toBe("// browser");
  });

  it("restores unfinished code and hints into an empty browser without requiring a pass", async () => {
    const from = memoryStore(), to = memoryStore();
    saveScript("Player", "// unfinished", from);
    saveOpenedHints(l1.title, 1, from);
    const plan = await planImport(await exportEverything(course, from), course, to);
    expect(plan.summary).toContain("saved lesson work");
    await plan.apply();
    expect(to.getItem("code:Player")).toBe("// unfinished");
    expect(to.getItem(`hints:${l1.title}`)).toBe("1");
    expect(isPassed(l1.title, to)).toBe(false);
    expect((await planImport(await exportEverything(course, from), course, to)).summary).toContain("Nothing changes");
  });

  it("does not overwrite code edited after import confirmation was prepared", async () => {
    const from = memoryStore(), to = memoryStore();
    saveScript("Player", "// backup", from);
    const plan = await planImport(await exportEverything(course, from), course, to);
    saveScript("Player", "// new edit", to);
    await plan.apply();
    expect(to.getItem("code:Player")).toBe("// new edit");
  });

  it("Achievements are the union; settings only fill gaps", async () => {
    const from = memoryStore();
    saveEarned("jump", from);
    from.setItem("theme", "light");
    from.setItem("sound:muted", "1");
    const to = memoryStore();
    saveEarned("steps", to);
    to.setItem("theme", "dark");
    const plan = await planImport(await exportEverything(course, from), course, to);
    expect(plan.summary).toBe("Adds 1 Achievement. Nothing here is overwritten.");
    await plan.apply();
    expect([...loadEarned(to)].sort()).toEqual(["jump", "steps"]);
    expect(to.getItem("theme")).toBe("dark");
    expect(to.getItem("sound:muted")).toBe("1");
  });

  it("skips a Project already here, renames one changed since, adds the rest under their ids", async () => {
    const s = await migrated();
    const same = await createProject("blank", course, s);
    const changed = await createProject("blank", course, s);
    const gone = await createProject("platformer", course, s);
    const file = await exportEverything(course, s);
    await saveProject({ ...changed, scripts: { Game: "// edited" } }, s);
    await clear();
    await migrateProjects(s);
    for (const p of [same, { ...changed, scripts: { Game: "// edited" } }]) await saveProject(p, s);

    const plan = await planImport(file, course, s);
    expect(plan.summary).toBe("Adds 2 Projects. Nothing here is overwritten.");
    await plan.apply();
    const after = await loadProjects(s);
    expect(after.map((p) => p.name).sort()).toEqual(["Blank", "Blank", "Blank (imported)", "My platformer"]);
    expect(after.find((p) => p.id === gone.id)?.name).toBe("My platformer");
    expect(after.find((p) => p.id === changed.id)?.scripts.Game).toBe("// edited");
    expect((await planImport(file, course, s)).summary).toBe("Everything in this file is already here. Nothing changes.");
  });

  it("round-trips a Project's own image through a backup", async () => {
    const s = await migrated();
    const p = await createProject("blank", course, s);
    const bytes = new Uint8Array(33);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
    new DataView(bytes.buffer).setUint32(16, 8);
    new DataView(bytes.buffer).setUint32(20, 8);
    const image = new Blob([bytes], { type: "image/png" });
    await saveProjectWithImages(p, { Game: image }, s);
    const file = await exportEverything(course, s);
    await clear();
    const plan = await planImport(file, course, s);
    expect(plan.summary).toBe("Adds 1 Project. Nothing here is overwritten.");
    await plan.apply();
    const restored = (await loadProject(p.id, s))!;
    expect(restored.project).toEqual(p);
    expect(new Uint8Array(await restored.images.Game.arrayBuffer())).toEqual(bytes);
  });

  it("refuses a bad file without writing anything", async () => {
    const s = memoryStore();
    for (const text of ["{nope", JSON.stringify({ format: "other" }), JSON.stringify({ format: "learn-dev-backup", version: 9, progress: {}, projects: [] })])
      await expect(planImport(text, course, s)).rejects.toThrow(/^This file can't be opened: /);
  });

  it("takes a single Project file before Sandbox unlocks", async () => {
    const s = await migrated();
    const file = await exportProject(await createProject("blank", course, s));
    await clear();
    await migrateProjects(s);
    const plan = await planImport(file, course, s);
    expect(plan).toMatchObject({ single: true, summary: 'Adds the Project "Blank". Nothing here is overwritten.' });
    await plan.apply();
    expect((await loadProjects(s)).map((p) => p.name)).toEqual(["Blank"]);
  });
});

describe("the backup reminder", () => {
  const now = Date.UTC(2026, 9, 29);

  it("never backed up: only once Lesson 1 is passed", () => {
    const s = memoryStore();
    expect(backupReminder(course, s, now)).toBeNull();
    markPassed(l1.title, s);
    expect(backupReminder(course, s, now)).toBe("💾 You've never backed up your saves");
  });

  it("shows 7+ days after the last backup, only if something new was saved since", () => {
    const s = memoryStore();
    s.setItem("backup:last", String(now - 12 * DAY));
    s.setItem("saves:changed", String(now - 13 * DAY));
    expect(backupReminder(course, s, now)).toBeNull();
    s.setItem("saves:changed", String(now - 2 * DAY));
    expect(backupReminder(course, s, now)).toBe("💾 Your last backup was 12 days ago");
    s.setItem("backup:last", String(now - 6 * DAY));
    expect(backupReminder(course, s, now)).toBeNull();
  });

  it("Not now hides it for 7 days", () => {
    const s = memoryStore();
    markPassed(l1.title, s);
    snoozeReminder(s, now);
    expect(backupReminder(course, s, now + 6 * DAY)).toBeNull();
    expect(backupReminder(course, s, now + 7 * DAY)).not.toBeNull();
  });
});

it("round-trips contact projects in backups and rejects unsupported embedded versions before modifying anything", async () => {
  await clear();
  const from = await migrated();
  const project = await createProject("blank", course, from);
  project.level.boxes[0].collider = true;
  await saveProject(project, from);
  const file = JSON.parse(await exportEverything(course, from));
  expect(file.projects[0].version).toBe(2);
  await clear();
  const into = await migrated();
  await (await planImport(JSON.stringify(file), course, into)).apply();
  expect((await loadProjects(into))[0].level.boxes[0].collider).toBe(true);
  file.progress[`passed:${l1.title}`] = "1";
  file.projects[0].version = 3;
  const before = await loadProjects(into);
  await expect(planImport(JSON.stringify(file), course, into)).rejects.toThrow();
  expect(into.getItem(`passed:${l1.title}`)).toBeNull();
  expect(await loadProjects(into)).toEqual(before);
});

it.each(["not JSON", "null", "[]", '{"Player":42}', '{"bad-name":"code"}'])("rejects damaged backup snapshot %s before any writes", async (snapshot) => {
  const store = memoryStore();
  const file = { format: "learn-dev-backup", version: 1, progress: { [`passed:${l1.title}`]: "1", [`snapshot:${l1.title}`]: snapshot }, projects: [] };
  await expect(planImport(JSON.stringify(file), course, store)).rejects.toThrow();
  expect(store.getItem(`passed:${l1.title}`)).toBeNull();
});
