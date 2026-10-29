// Sandbox mode (spec 015): the engine on its own, with Projects saved apart from the Course code.
import { api } from "./engine";
import { isPassed } from "./check";
import { type Lesson, loadScripts } from "./lesson";

export type Project = { id: string; name: string; scripts: Record<string, string>; level: Lesson["level"] };

/** A secret until the Course's last Lesson is passed. */
export const sandboxUnlocked = (lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) =>
  lessons.length > 0 && isPassed(lessons[lessons.length - 1].title, store);

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

const KEY = "sandbox:projects";
export const loadProjects = (store: Pick<Storage, "getItem"> = localStorage): Project[] => JSON.parse(store.getItem(KEY) ?? "[]");

/** Saves a new Project at the end, or replaces the one with its id. */
export function saveProject(project: Project, store: Pick<Storage, "getItem" | "setItem"> = localStorage) {
  const list = loadProjects(store);
  const i = list.findIndex((p) => p.id === project.id);
  list.splice(i < 0 ? list.length : i, i < 0 ? 0 : 1, project);
  store.setItem(KEY, JSON.stringify(list));
}

export const deleteProject = (id: string, store: Pick<Storage, "getItem" | "setItem"> = localStorage) =>
  store.setItem(KEY, JSON.stringify(loadProjects(store).filter((p) => p.id !== id)));

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function add(project: Omit<Project, "id">, store: Pick<Storage, "getItem" | "setItem">) {
  const p = { ...project, id: newId() };
  saveProject(p, store);
  return p;
}

/** Blank: one hidden box tagged Game runs Game.ts. My platformer: a one-time copy of the Course code in the playground. */
export const createProject = (kind: "blank" | "platformer", lessons: Pick<Lesson, "scripts">[], store: Pick<Storage, "getItem" | "setItem"> = localStorage) =>
  add(kind === "blank"
    ? { name: "Blank", scripts: { Game: scriptStub("Game") }, level: { boxes: [{ tag: "Game", x: 0, y: 0, w: 0, h: 0, color: "transparent", script: "Game" }] } }
    : { name: "My platformer", scripts: loadScripts(lessons, lessons.length - 1, store), level: playground }, store);

export const duplicateProject = (project: Project, store: Pick<Storage, "getItem" | "setItem"> = localStorage) =>
  add({ ...structuredClone(project), name: `${project.name} copy` }, store);
