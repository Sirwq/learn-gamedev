// Sandbox mode (spec 015): the engine on its own, with Projects saved apart from the Course code.
import { api } from "./engine";
import { isPassed } from "./check";
import { type Lesson, loadScripts } from "./lesson";
import { withoutNoteComment } from "./lessons/ai-note";
import { delMany, get, getMany, keys, set, setMany } from "idb-keyval";

export type Project = { id: string; name: string; scripts: Record<string, string>; level: Lesson["level"] };

/** A secret until the Course's last Lesson is passed, or the dev build's unlock flag is set. */
export const sandboxUnlocked = (lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) =>
  (lessons.length > 0 && isPassed(lessons[lessons.length - 1].title, store)) ||
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
/** Other tabs (and this tab's menu) refresh their Sandbox list. */
function changed() {
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
  changed();
}

/** Removes the Project and its images. */
export async function deleteProject(id: string, store: Local = localStorage) {
  if (onIdb(store)) await delMany([projectKey(id), ...(await imageKeys(id))]);
  else store.setItem(KEY, JSON.stringify(readLocal(store).filter((p) => p.id !== id)));
  changed();
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
  changed();
  return copy;
}
