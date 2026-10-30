// Sandbox mode (spec 015): the engine on its own, with Projects saved apart from the Course code.
import { api } from "./engine";
import { chapterTwoUnlocked } from "./check";
import type { Lesson } from "./lesson";
import tourPlayer from "./sandbox-tour/Player.ts?raw";
import tourHUD from "./sandbox-tour/HUD.ts?raw";

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
    { tag: "Box", x: 1320, y: 40, w: 40, h: 40, color: "#a86" },
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

export const tour: Omit<Project, "id"> = {
  name: "Example: Sandbox tour",
  scripts: { Player: tourPlayer, HUD: tourHUD },
  level: { boxes: [
    { tag: "Player", x: 80, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
    { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    { tag: "Platform", x: 260, y: 80, w: 140, h: 20, color: "#a86" },
    { tag: "Coin", x: 300, y: 120, w: 20, h: 20, color: "gold" },
    { tag: "Coin", x: 440, y: 50, w: 20, h: 20, color: "gold" },
    { tag: "Coin", x: 600, y: 50, w: 20, h: 20, color: "gold" },
    { tag: "Friend", x: 740, y: 40, w: 32, h: 32, color: "#a86" },
    { tag: "Flag", x: 850, y: 40, w: 24, h: 64, color: "gold" },
    { tag: "HUD", x: 0, y: 0, w: 0, h: 0, color: "transparent", script: "HUD" },
  ] },
};
