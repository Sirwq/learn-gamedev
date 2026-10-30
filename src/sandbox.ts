// Sandbox mode (spec 015): the engine on its own, with Projects saved apart from the Course code.
import { api } from "./engine";
import { chapterTwoUnlocked } from "./check";
import { type Lesson, loadScripts } from "./lesson";
import { withoutNoteComment } from "./lessons/ai-note";
import { delMany, get, getMany, keys, set, setMany } from "idb-keyval";

export type Project = { id: string; name: string; scripts: Record<string, string>; level: Lesson["level"] };

/** A secret until Lesson 15 is passed, or the dev build's unlock flag is set. */
export const sandboxUnlocked = (lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) =>
  chapterTwoUnlocked(lessons, store) ||
  (import.meta.env.DEV && store.getItem("dev:sandbox-unlocked") === "1");

/** Dev build only: open Sandbox without passing the Course. Locking keeps the Projects. */
export const setDevUnlock = (on: boolean, store: Pick<Storage, "setItem" | "removeItem"> = localStorage) =>
  on ? store.setItem("dev:sandbox-unlocked", "1") : store.removeItem("dev:sandbox-unlocked");

/** A new Script's stub: the class name must match the file, like every Course Script. */
export const scriptStub = (name: string) => `class ${name} extends MonoBehaviour {
  Start() {
  }

  Update() {
  }
}
`;

/** "" when the name works as a new Script, else why not. */
export function scriptNameError(name: string, existing: string[]) {
  if (!/^[A-Z][A-Za-z0-9_]*$/.test(name)) return "A Script name starts with a capital letter and has only letters, digits and _, like Coin.";
  if (existing.includes(name)) return `There is already a ${name}.ts.`;
  if (name in api) return `${name} is part of the engine API. Pick another name.`;
  return "";
}

/** "+ Script" and "+ New Script…": a Start() / Update() stub under a valid name; returns what is wrong with the name, or "". */
export function addScript(project: Pick<Project, "scripts">, name: string) {
  const error = scriptNameError(name, Object.keys(project.scripts));
  if (!error) project.scripts[name] = scriptStub(name);
  return error;
}

/** "My platformer"'s hand-made Level: every tag, wider than the screen, fit for the Course's Reference code. */
export const playground: Lesson["level"] = {
  width: 2480,
  boxes: [
    { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
    { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
    { tag: "Ground", x: -480, y: 0, w: 780, h: 40, color: "#5a3" },
    { tag: "Platform", x: 300, y: 40, w: 120, h: 20, color: "#a86", script: "MovingPlatform" },
    { tag: "Water", x: 300, y: 0, w: 1000, h: 50, color: "#36c" },
    { tag: "Ground", x: 1300, y: 0, w: 1180, h: 40, color: "#5a3" },
    { tag: "Platform", x: 1380, y: 130, w: 140, h: 20, color: "#a86" },
    { tag: "Platform", x: 1560, y: 230, w: 140, h: 20, color: "#a86" },
    { tag: "Coin", x: 1438, y: 170, w: 24, h: 24, color: "gold" },
    { tag: "Coin", x: 1618, y: 270, w: 24, h: 24, color: "gold" },
    { tag: "Wall", x: 1760, y: 40, w: 40, h: 60, color: "#888" },
    { tag: "Enemy", x: 1880, y: 40, w: 40, h: 40, color: "crimson", script: "Enemy" },
    { tag: "Wall", x: 2080, y: 40, w: 40, h: 60, color: "#888" },
    { tag: "Spikes", x: 2180, y: 40, w: 80, h: 16, color: "#ccd" },
    { tag: "Flag", x: 2360, y: 40, w: 24, h: 64, color: "gold" },
    { tag: "Wall", x: 2440, y: 40, w: 40, h: 300, color: "#888" },
  ],
};

// Projects live in IndexedDB (spec 051): `project:<id>` the JSON, `image:<id>:<tag>[:top]` PNG Blobs.
// Until the one-time migration from localStorage's `sandbox:projects` has succeeded they stay in localStorage.
const KEY = "sandbox:projects";
const MIGRATED = "storage:v2";
/** Ids of the localStorage Projects already copied over, so a Project deleted in IndexedDB is not re-imported. */
const SEEN = "migrated-ids";
type Local = Pick<Storage, "getItem" | "setItem">;
const onIdb = (store: Pick<Storage, "getItem">) => store.getItem(MIGRATED) === "1";
const readLocal = (store: Pick<Storage, "getItem">) => JSON.parse(store.getItem(KEY) ?? "[]") as Project[];
const projectKey = (id: string) => `project:${id}`;
const entry = (p: Project): [string, unknown] => [projectKey(p.id), p];
const imageKeys = async (id: string) => (await keys<string>()).filter((k) => k.startsWith(`image:${id}:`));
const clean = (p: Project): Project => ({
  ...p, scripts: Object.fromEntries(Object.entries(p.scripts).map(([n, c]) => [n, withoutNoteComment(c)])),
});
/** Other tabs (and this tab's menu) refresh their Sandbox list; the backup reminder sees something new. */
function changed(store: Pick<Storage, "setItem">) {
  store.setItem("saves:changed", String(Date.now()));
  const channel = new BroadcastChannel("projects");
  channel.postMessage("changed");
  channel.close();
}

/** One-time copy of `sandbox:projects` into IndexedDB, flagged only once read back. Safe to run twice; never deletes the old key. */
export async function migrateProjects(store: Pick<Storage, "getItem" | "setItem"> = localStorage) {
  const run = async () => {
    if (onIdb(store)) return;
    const list = readLocal(store);
    await setMany([...list.map(entry), [SEEN, list.map((p) => p.id)]]);
    const back = await getMany(list.map((p) => projectKey(p.id)));
    if (back.every(Boolean)) store.setItem(MIGRATED, "1");
  };
  if (onIdb(store)) return;
  try {
    await (navigator.locks ? navigator.locks.request("storage-migrate", run) : run());
  } catch {
    // The flag stays unset: this session keeps Projects in localStorage and the next load tries again.
  }
}

export async function loadProjects(store: Pick<Storage, "getItem"> = localStorage): Promise<Project[]> {
  if (!onIdb(store)) return readLocal(store).map(clean);
  // A tab from before the migration may still write `sandbox:projects`: take in Projects it added since.
  const seen = new Set((await get<string[]>(SEEN)) ?? []);
  const fresh = readLocal(store).filter((p) => !seen.has(p.id));
  if (fresh.length) await setMany([...fresh.map(entry), [SEEN, [...seen, ...fresh.map((p) => p.id)]]]);
  // Keys come back sorted, and ids start with the creation time: oldest first, like the old list.
  // Only the Project keys are read: entries() would load every image Blob too.
  const ids = (await keys<string>()).filter((k) => k.startsWith("project:"));
  return (await getMany<Project>(ids)).map((p) => clean(p!));
}

/** Asks once, on the first save (a user gesture), for storage the browser won't evict; a "no" is not asked again. */
function askPersist(store: Local) {
  if (store.getItem("storage:persist-asked") || !navigator.storage?.persist) return;
  store.setItem("storage:persist-asked", "1");
  navigator.storage.persisted().then((yes) => yes || navigator.storage.persist()).catch(() => {});
}

/** Saves a new Project at the end, or replaces the one with its id. */
export async function saveProject(project: Project, store: Local = localStorage) {
  askPersist(store);
  if (onIdb(store)) await set(projectKey(project.id), project);
  else {
    const list = readLocal(store);
    const i = list.findIndex((p) => p.id === project.id);
    list.splice(i < 0 ? list.length : i, i < 0 ? 0 : 1, project);
    store.setItem(KEY, JSON.stringify(list));
  }
  changed(store);
}

/** Removes the Project and its images. */
export async function deleteProject(id: string, store: Local = localStorage) {
  if (onIdb(store)) await delMany([projectKey(id), ...(await imageKeys(id))]);
  else store.setItem(KEY, JSON.stringify(readLocal(store).filter((p) => p.id !== id)));
  changed(store);
}

/** Own images (spec 050) need IndexedDB: false while Projects still live in localStorage. */
export const canStoreImages = (store: Pick<Storage, "getItem"> = localStorage) => onIdb(store);

/** The Project's own images as Blobs by `<tag>[:top]`. */
export async function loadImageBlobs(id: string): Promise<Record<string, Blob>> {
  const names = await imageKeys(id);
  const blobs = await getMany<Blob>(names);
  return Object.fromEntries(names.map((k, i) => [k.slice(`image:${id}:`.length), blobs[i]!]));
}

/** Writes the Project's images as they are now: new and replaced ones set, the rest dropped. */
export async function saveImages(id: string, images: Record<string, Blob>, store: Local = localStorage) {
  if (!onIdb(store)) throw new Error("Images can't be saved in this browser right now. Reload the page and try again.");
  askPersist(store);
  const stale = (await imageKeys(id)).filter((k) => !Object.hasOwn(images, k.slice(`image:${id}:`.length)));
  await setMany(Object.entries(images).map(([k, b]): [string, unknown] => [`image:${id}:${k}`, b]));
  await delMany(stale);
  changed(store);
}

let lastTime = 0;
// Strictly increasing time part, so ids sort in creation order even within one millisecond.
const newId = () => (lastTime = Math.max(Date.now(), lastTime + 1)).toString(36) + Math.random().toString(36).slice(2, 8);

async function add(project: Omit<Project, "id">, store: Local) {
  const p = { ...project, id: newId() };
  await saveProject(p, store);
  return p;
}

/** Blank: one hidden box tagged Game runs Game.ts. My platformer: a one-time copy of the Course code in the playground. */
export const createProject = (kind: "blank" | "platformer", lessons: Pick<Lesson, "scripts">[], store: Local = localStorage) =>
  add(kind === "blank"
    ? { name: "Blank", scripts: { Game: scriptStub("Game") }, level: { boxes: [{ tag: "Game", x: 0, y: 0, w: 0, h: 0, color: "transparent", script: "Game" }] } }
    : { name: "My platformer", scripts: loadScripts(lessons, lessons.length - 1, store), level: playground }, store);

/** A copy with a new id; the Project and its images are written in one transaction. */
export async function duplicateProject(project: Project, store: Local = localStorage) {
  const copy = { ...structuredClone(project), name: `${project.name} copy`, id: newId() };
  if (!onIdb(store)) return saveProject(copy, store).then(() => copy);
  askPersist(store);
  const images = await imageKeys(project.id);
  const blobs = await getMany(images);
  await setMany([entry(copy), ...images.map((k, i): [string, unknown] => [k.replace(`image:${project.id}:`, `image:${copy.id}:`), blobs[i]])]);
  changed(store);
  return copy;
}

// One Project as a file (spec 051): its JSON and its images as base64 PNG data URLs, to keep or to send to a friend.
export const PROJECT_FORMAT = "learn-dev-project";
const VERSION = 1;
const MAX_IMAGE = 256;
const PNG_URL = "data:image/png;base64,";

/** `<name>.learn-dev.json`, with characters no file system allows replaced. */
export const exportFileName = (name: string) => `${name.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim() || "Project"}.learn-dev.json`;

export async function exportProject(project: Project) {
  const keys = await imageKeys(project.id);
  const blobs = await getMany<Blob>(keys);
  const images: Record<string, string> = {};
  for (const [i, k] of keys.entries()) {
    const bytes = new Uint8Array(await blobs[i]!.arrayBuffer());
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    images[k.slice(`image:${project.id}:`.length)] = PNG_URL + btoa(bin);
  }
  const { id: _, ...rest } = project;
  return JSON.stringify({ format: PROJECT_FORMAT, version: VERSION, project: rest, images });
}

const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isArt = (a: unknown) => isObj(a) && (a.draw === "stretch" || a.draw === "tile") && typeof a.pixel === "boolean";
const isBox = (b: unknown) => isObj(b) && typeof b.tag === "string" && typeof b.color === "string" &&
  ["x", "y", "w", "h"].every((k) => isNum(b[k])) && (b.script === undefined || typeof b.script === "string");

/** The PNG's bytes, or why the data URL is refused. Reads the header only: nothing from the file is decoded or drawn. */
function pngBytes(url: unknown): Uint8Array | string {
  if (typeof url !== "string" || !url.startsWith(PNG_URL)) return "an image that isn't a PNG";
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(url.slice(PNG_URL.length)), (c) => c.charCodeAt(0));
  } catch {
    return "a broken image";
  }
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || sig.some((b, i) => bytes[i] !== b)) return "an image that isn't a PNG";
  const view = new DataView(bytes.buffer);
  if (view.getUint32(16) > MAX_IMAGE || view.getUint32(20) > MAX_IMAGE) return `an image bigger than ${MAX_IMAGE}×${MAX_IMAGE}`;
  return bytes;
}

/** A checked Project file: the Project without its id, and its images as PNG Blobs by `<tag>[:top]`. */
export type ProjectFile = { project: Omit<Project, "id">; pngs: [string, Blob][] };

/** Checks one exported Project (the parsed file); throws a plain message for a bad one. */
export function checkProjectFile(file: unknown): ProjectFile {
  const bad = (why: string) => new Error(`This file can't be opened: ${why}.`);
  if (!isObj(file) || file.format !== PROJECT_FORMAT) throw bad("it isn't a learn-dev Project file");
  if (!isNum(file.version) || (file.version as number) > VERSION) throw bad("it comes from a newer learn-dev. Reload the page and try again");
  const { project: p, images = {} } = file;
  const level = isObj(p) ? p.level : undefined;
  if (!isObj(p) || typeof p.name !== "string" || !isObj(p.scripts) || !isObj(level) || !Array.isArray(level.boxes) ||
    !Object.entries(p.scripts).every(([n, c]) => /^[A-Z][A-Za-z0-9_]*$/.test(n) && typeof c === "string") ||
    !level.boxes.every(isBox) || !["width", "height"].every((k) => level[k] === undefined || isNum(level[k])) ||
    !(level.art === undefined || (isObj(level.art) && Object.values(level.art).every(isArt))) ||
    !(level.camera === undefined || (isObj(level.camera) && ["x", "y", "size"].every((k) => isNum((level.camera as Record<string, unknown>)[k])))) ||
    !isObj(images))
    throw bad("the Project in it is damaged");
  const pngs: [string, Blob][] = [];
  for (const [k, url] of Object.entries(images)) {
    if (!/^[\w%.!~*'()-]+(:top)?$/.test(k)) throw bad("the Project in it is damaged"); // imageName: an escaped tag
    const bytes = pngBytes(url);
    if (typeof bytes === "string") throw bad(`it has ${bytes}`);
    pngs.push([k, new Blob([bytes as BlobPart], { type: "image/png" })]);
  }
  return { project: { name: p.name, scripts: p.scripts as Project["scripts"], level: level as Project["level"] }, pngs };
}

/** Writes a checked Project file under this id (a new one by default) with its images, in one transaction. */
export async function addProjectFile({ project: p, pngs }: ProjectFile, store: Local = localStorage, id = newId()) {
  const project: Project = { id, ...p };
  if (!onIdb(store)) {
    if (pngs.length) throw new Error("Projects with images can't be saved in this browser right now. Reload the page and try again.");
    return saveProject(project, store).then(() => project);
  }
  askPersist(store);
  await setMany([entry(project), ...pngs.map(([k, b]): [string, unknown] => [`image:${project.id}:${k}`, b])]);
  changed(store);
  return project;
}

/** Checks an exported file and adds it as a new Project; throws a plain message, having written nothing, for a bad one. */
export async function importProject(text: string, store: Local = localStorage) {
  let file: unknown;
  try {
    file = JSON.parse(text);
  } catch {
    throw new Error("This file can't be opened: it isn't a learn-dev Project file.");
  }
  return addProjectFile(checkProjectFile(file), store);
}
