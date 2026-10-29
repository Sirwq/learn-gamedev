import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../10-coins/reference/Player.ts?raw"; // code carries over: the Lesson starts from Player's last Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "12. Stomp",
  concept: "comparing positions",
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
  // The enemy is gone the same frame it is stomped, so any touch it survives is from the side or below.
  goals: [{ message: "Stomp the enemy", test: (world) => !world.some((o) => o.tag === "Enemy") }],
  lose: [
    offScreen,
    {
      message: "The enemy hurt you. Land on its head instead. Press Run to try again.",
      test: (world) => world.some((o) => o.tag === "Enemy" && overlaps(find(world, "Player"), o)),
    },
  ],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
