import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "./stub/Enemy.ts?raw";
import reference from "./reference/Enemy.ts?raw";

export const lesson: Lesson = {
  title: "11. Enemy patrol",
  concept: "a second Script: Enemy",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Wall", x: 260, y: 40, w: 40, h: 60, color: "#888" },
      { tag: "Enemy", x: 380, y: 40, w: 40, h: 40, color: "crimson", script: "Enemy" },
      { tag: "Wall", x: 560, y: 40, w: 40, h: 60, color: "#888" },
      { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
    ],
  },
  // Both in one Run: the enemy has to walk one way, turn at a wall and walk back.
  goals: [
    { message: "The enemy walks to the right wall", test: (world) => { const e = find(world, "Enemy"); return e.x + e.w >= 560; } },
    { message: "The enemy walks back to the left wall", test: (world) => find(world, "Enemy").x <= 300 },
  ],
  lose: [
    offScreen,
    { message: "You touched the enemy. Press Run to try again.", test: (world) => overlaps(find(world, "Player"), find(world, "Enemy")) },
  ],
  // A new Script: Player carries on unchanged from Lesson 10.
  scripts: { Enemy: { stub, reference } },
  hints: splitHints(hints),
};
