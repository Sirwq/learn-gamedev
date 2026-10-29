import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../06-land/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "7. Many platforms",
  concept: "arrays and for",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Platform", x: 200, y: 120, w: 140, h: 20, color: "#a86" },
      { tag: "Platform", x: 420, y: 220, w: 140, h: 20, color: "#a86" },
      { tag: "Platform", x: 640, y: 320, w: 140, h: 20, color: "#a86" },
      { tag: "Flag", x: 700, y: 400, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  // Each platform is only in reach from the one below it, and the flag only from the top one.
  goals: [{ message: "Climb the platforms to the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [offScreen],
  scripts: { Player: { stub: withNoteComment(stub), reference } },
  hints: splitHints(hints),
};
