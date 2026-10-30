// Export everything / Import everything (spec 059): every Project plus Course progress in one file, merged in without overwriting.
import { achievements } from "./achievements";
import { isPassed } from "./check";
import type { Lesson } from "./lesson";
import { addProjectFile, exportProject, loadProjects } from "./project-storage";
import { checkProjectFile, PROJECT_FORMAT, type ProjectFile } from "./project-file";
import type { Project } from "./sandbox";
import { t } from "./i18n";

const FORMAT = "learn-dev-backup";
const VERSION = 1;
const DAY = 864e5;
const LAST = "backup:last";
const SNOOZE = "backup:snoozed";
const CHANGED = "saves:changed";
const SETTINGS = ["theme", "editor:fontSize", "sound:muted"];
type Store = Pick<Storage, "getItem" | "setItem">;
type Course = Pick<Lesson, "title" | "scripts">[];

/** Saves the text as a file through the browser's download. */
export function download(text: string, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href));
}

/** `learn-dev-backup-YYYY-MM-DD.json`, in local time. */
export const backupFileName = (now = new Date()) =>
  `learn-dev-backup-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.json`;

/** Every Course progress key the app writes (never `dev:sandbox-unlocked`). */
const progressKeys = (course: Course) => [
  ...course.flatMap((l) => [`passed:${l.title}`, `hints:${l.title}`, `snapshot:${l.title}`]),
  ...new Set(course.flatMap((l) => Object.keys(l.scripts).map((n) => `code:${n}`))),
  ...achievements.map((a) => `achievement:${a.id}`),
  ...SETTINGS,
];

/** The backup file's text; marks now as the last backup. */
export async function exportEverything(course: Course, store: Store = localStorage) {
  const progress: Record<string, string> = {};
  for (const k of progressKeys(course)) {
    const v = store.getItem(k);
    if (v !== null) progress[k] = v;
  }
  const projects = await Promise.all((await loadProjects(store)).map(async (p) => ({ id: p.id, ...JSON.parse(await exportProject(p)) })));
  store.setItem(LAST, String(Date.now()));
  return JSON.stringify({ format: FORMAT, version: VERSION, progress, projects });
}

const plural = (n: number, one: "Lesson passed" | "Achievement" | "Project" | "day") => {
  switch (one) {
    case "Lesson passed": return t.count("{count} Lesson passed", "{count} Lessons passed", n);
    case "Achievement": return t.count("{count} Achievement", "{count} Achievements", n);
    case "Project": return t.count("{count} Project", "{count} Projects", n);
    case "day": return t.count("{count} day", "{count} days", n);
  }
};

export type ImportPlan = { summary: string; apply: () => Promise<Project | void>; single?: boolean };

/** Reads a backup or a single Project file without writing anything; `apply` does the import. Throws a plain message for a bad file. */
export async function planImport(text: string, course: Course, store: Store = localStorage): Promise<ImportPlan> {
  const bad = new Error(t("This file can't be opened: it isn't a learn-dev backup or Project file."));
  let file: Record<string, unknown>;
  try {
    file = JSON.parse(text);
  } catch {
    throw bad;
  }
  if (file?.format === PROJECT_FORMAT) {
    const p = checkProjectFile(file);
    return { single: true, summary: t("Adds the Project \"{name}\". Nothing here is overwritten.", { name: p.project.name }), apply: () => addProjectFile(p, store) };
  }
  if (file?.format !== FORMAT || typeof file.progress !== "object" || !file.progress || !Array.isArray(file.projects)) throw bad;
  if (typeof file.version !== "number" || file.version > VERSION) throw new Error(t("This file can't be opened: it comes from a newer learn-dev. Reload the page and try again."));
  const from = file.progress as Record<string, unknown>;
  const has = (k: string) => typeof from[k] === "string";
  const take: [string, string][] = [];
  // A Lesson the file has passed and this browser hasn't comes in with its hints and snapshot, and the code of its Scripts.
  const newly = course.flatMap((l, i) => (from[`passed:${l.title}`] === "1" && !isPassed(l.title, store) ? [i] : []));
  for (const i of newly) for (const k of ["passed", "hints", "snapshot"].map((p) => `${p}:${course[i].title}`)) if (has(k)) take.push([k, from[k] as string]);
  if (newly.length)
    for (const n of new Set(course.slice(0, Math.max(...newly) + 1).flatMap((l) => Object.keys(l.scripts)))) if (has(`code:${n}`)) take.push([`code:${n}`, from[`code:${n}`] as string]);
  const earned = achievements.map((a) => `achievement:${a.id}`).filter((k) => from[k] === "1" && store.getItem(k) !== "1");
  for (const k of earned) take.push([k, "1"]);
  for (const k of SETTINGS) if (has(k) && store.getItem(k) === null) take.push([k, from[k] as string]);
  // Same id and content: skipped. Same id, other content: a new Project "<name> (imported)", unless that copy is already here too.
  // Otherwise added under its own id, so importing the same file again adds nothing.
  const mine = await loadProjects(store);
  const key = (name: unknown, f: Record<string, unknown>) => JSON.stringify([name, (f.project as Project).scripts, (f.project as Project).level, f.images ?? {}]);
  const here = new Map(await Promise.all(mine.map(async (p) => [p.id, key(p.name, JSON.parse(await exportProject(p)))] as const)));
  const contents = new Set(here.values());
  const adds: [ProjectFile, string | undefined][] = [];
  for (const raw of file.projects as Record<string, unknown>[]) {
    const p = checkProjectFile(raw);
    const id = typeof raw?.id === "string" && /^\w+$/.test(raw.id) ? raw.id : undefined;
    const name = `${p.project.name} (imported)`;
    if (!id || !here.has(id)) adds.push([p, id]);
    else if (here.get(id) !== key(p.project.name, raw) && !contents.has(key(name, raw))) adds.push([{ ...p, project: { ...p.project, name } }, undefined]);
  }
  const parts = [
    newly.length && plural(newly.length, "Lesson passed"),
    earned.length && plural(earned.length, "Achievement"),
    adds.length && plural(adds.length, "Project"),
  ].filter(Boolean);
  return {
    summary: parts.length ? t("Adds {items}. Nothing here is overwritten.", { items: parts.join(", ") }) : t("Everything in this file is already here. Nothing changes."),
    apply: async () => {
      for (const [k, v] of take) store.setItem(k, v);
      for (const [p, id] of adds) await addProjectFile(p, store, id);
    },
  };
}

/** "today", "1 day ago", "12 days ago". */
export const daysAgo = (then: number, now = Date.now()) => {
  const d = Math.floor((now - then) / DAY);
  return d < 1 ? t("today") : t("{days} ago", { days: plural(d, "day") });
};

/** The menu's backup line, or null: 7+ days since the last Export everything with something saved since; with none, once Lesson 1 is passed. */
export function backupReminder(course: Course, store: Store = localStorage, now = Date.now()) {
  if (now < Number(store.getItem(SNOOZE))) return null;
  const last = Number(store.getItem(LAST));
  if (!last) return course.length && isPassed(course[0].title, store) ? t("💾 You've never backed up your saves") : null;
  if (now - last < 7 * DAY || !(Number(store.getItem(CHANGED)) > last)) return null;
  return t("💾 Your last backup was {when}", { when: daysAgo(last, now) });
}

/** "Not now": no reminder for 7 days. */
export const snoozeReminder = (store: Pick<Storage, "setItem"> = localStorage, now = Date.now()) => store.setItem(SNOOZE, String(now + 7 * DAY));

/** The Saves dialog's "Last backup: …". */
export const lastBackup = (store: Pick<Storage, "getItem"> = localStorage) => {
  const last = Number(store.getItem(LAST));
  return last ? daysAgo(last) : t("never");
};
