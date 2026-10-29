import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../01-move/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "2. Speed",
  concept: "fields and Time.deltaTime",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 40, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Flag", x: 880, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  goals: [{ message: "Reach the flag within 3 seconds", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [offScreen, { message: "Too slow: 3 seconds are up. Press Run to try again.", test: (_, time) => time > 3 }],
  scripts: { Player: { stub: withNoteComment(stub), reference } },
  hints: splitHints(hints),
};
