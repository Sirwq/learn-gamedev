import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "./stub/MovingPlatform.ts?raw";
import reference from "./reference/MovingPlatform.ts?raw";

export const lesson: Lesson = {
  title: "15. Moving platforms",
  concept: "another object's motion",
  explanation: withNoteBox(explanation),
  level: {
    width: 2000,
    boxes: [
      { tag: "Player", x: 160, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Platform", x: 300, y: 40, w: 120, h: 20, color: "#a86", script: "MovingPlatform" },
      // Higher than the ground, so standing anywhere above it touches the water.
      { tag: "Water", x: 300, y: 0, w: 1000, h: 50, color: "#36c" },
      { tag: "Flag", x: 1500, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: -480, y: 0, w: 780, h: 40, color: "#5a3" },
      { tag: "Ground", x: 1300, y: 0, w: 700, h: 40, color: "#5a3" },
    ],
  },
  // The water is 1000 px wide and a jump goes about 320 px; walking along with the platform is no anti-cheat, the Level just makes riding it easy.
  goals: [{ message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [
    offScreen,
    { message: "You fell in the water. Press Run to try again.", test: (world) => overlaps(find(world, "Player"), find(world, "Water")) },
  ],
  // A new Script: Player carries on unchanged from Lesson 14.
  scripts: { MovingPlatform: { stub: stub, reference } },
  hints: splitHints(hints),
};
