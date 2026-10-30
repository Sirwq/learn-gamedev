// Complete Sandbox Project operations, including migration, images, and change notifications.
import { createStore, delMany, get, getMany, keys, promisifyRequest, set, setMany } from "idb-keyval";
import { type Lesson, loadScripts } from "./lesson";
import { withoutNoteComment } from "./lessons/ai-note";
import { playground, scriptStub, tour, type Project } from "./sandbox";
import { checkProjectFile, encodeProjectFile, type ProjectFile } from "./project-file";

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
const pending = new Map<string, Promise<unknown>>();
/** Keep edits to one Project in the order the student made them. A failed save does not block later edits. */
function ordered<T>(id: string, write: () => Promise<T>): Promise<T> {
  const next = (pending.get(id) ?? Promise.resolve()).catch(() => {}).then(write);
  pending.set(id, next);
  void next.then(() => { if (pending.get(id) === next) pending.delete(id); },
    () => { if (pending.get(id) === next) pending.delete(id); });
  return next;
}
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
function writeLocalProject(project: Project, store: Local) {
  const list = readLocal(store);
  const i = list.findIndex((p) => p.id === project.id);
  list.splice(i < 0 ? list.length : i, i < 0 ? 0 : 1, project);
  store.setItem(KEY, JSON.stringify(list));
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
export function saveProject(project: Project, store: Local = localStorage) {
  const snapshot = structuredClone(project);
  return ordered(project.id, async () => {
    askPersist(store);
    if (onIdb(store)) await set(projectKey(snapshot.id), snapshot);
    else writeLocalProject(snapshot, store);
    changed(store);
  });
}

/** Removes the Project and its images. */
export async function deleteProject(id: string, store: Local = localStorage) {
  await pending.get(id)?.catch(() => {});
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

/** Loads a Project and its own images as one page-facing result. */
export async function loadProject(id: string, store: Pick<Storage, "getItem"> = localStorage) {
  const project = (await loadProjects(store)).find((p) => p.id === id);
  return project ? { project, images: onIdb(store) ? await loadImageBlobs(id) : {} } : undefined;
}

/** Saves the Project and its current image set in one IndexedDB transaction. */
export function saveProjectWithImages(project: Project, images: Record<string, Blob>, store: Local = localStorage) {
  const snapshot = structuredClone(project);
  const imageSnapshot = { ...images };
  return ordered(project.id, async () => {
    if (!onIdb(store)) {
      if (Object.keys(imageSnapshot).length) throw new Error("Images can't be saved in this browser right now. Reload the page and try again.");
      askPersist(store);
      writeLocalProject(snapshot, store);
      changed(store);
      return;
    }
    askPersist(store);
    const prefix = `image:${snapshot.id}:`;
    const stale = (await imageKeys(snapshot.id)).filter((k) => !Object.hasOwn(imageSnapshot, k.slice(prefix.length)));
    const useStore = createStore("keyval-store", "keyval");
    await useStore("readwrite", (objectStore) => {
      try {
        objectStore.put(snapshot, projectKey(snapshot.id));
        for (const [name, blob] of Object.entries(imageSnapshot)) objectStore.put(blob, prefix + name);
        for (const key of stale) objectStore.delete(key);
      } catch (error) {
        objectStore.transaction.abort();
        throw error;
      }
      return promisifyRequest(objectStore.transaction);
    });
    changed(store);
  });
}

let lastTime = 0;
// Strictly increasing time part, so ids sort in creation order even within one millisecond.
const newId = () => (lastTime = Math.max(Date.now(), lastTime + 1)).toString(36) + Math.random().toString(36).slice(2, 8);

async function add(project: Omit<Project, "id">, store: Local) {
  const p = { ...project, id: newId() };
  await saveProject(p, store);
  return p;
}

/** Each + New choice saves an ordinary Project; My platformer copies the student's Course code once. */
export const createProject = (kind: "blank" | "platformer" | "tour", lessons: Pick<Lesson, "scripts">[], store: Local = localStorage) =>
  add(kind === "blank"
    ? { name: "Blank", scripts: { Game: scriptStub("Game") }, level: { boxes: [{ tag: "Game", x: 0, y: 0, w: 0, h: 0, color: "transparent", script: "Game" }] } }
    : kind === "tour" ? structuredClone(tour)
    : { name: "My platformer", scripts: loadScripts(lessons, lessons.length - 1, store), level: playground }, store);

/** A copy with a new id; the Project and its images are written in one transaction. */
export async function duplicateProject(project: Project, store: Local = localStorage) {
  await pending.get(project.id)?.catch(() => {});
  const copy = { ...structuredClone(project), name: `${project.name} copy`, id: newId() };
  if (!onIdb(store)) return saveProject(copy, store).then(() => copy);
  askPersist(store);
  const images = await imageKeys(project.id);
  const blobs = await getMany(images);
  await setMany([entry(copy), ...images.map((k, i): [string, unknown] => [k.replace(`image:${project.id}:`, `image:${copy.id}:`), blobs[i]])]);
  changed(store);
  return copy;
}

/** The Project and all its images in the portable JSON file. */
export async function exportProject(project: Project) {
  await pending.get(project.id)?.catch(() => {});
  const images = await loadImageBlobs(project.id);
  const { id: _, ...rest } = project;
  return JSON.stringify(await encodeProjectFile(rest, images));
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
