import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../08-walls/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "9. Camera follow",
  explanation: withNoteBox(explanation),
  level: {
    width: 2400,
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Wall", x: 1200, y: 40, w: 80, h: 70, color: "#888" },
      { tag: "Flag", x: 2200, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: -480, y: 0, w: 2880, h: 40, color: "#5a3" },
    ],
  },
  // The flag is past the right edge of the first screen, and leaving the camera's view loses.
  goals: [{ message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [{ ...offScreen, message: "You walked out of the camera's view. Press Run to try again." }],
  scripts: { Player: { stub: withNoteComment(stub), reference } },
  hints: splitHints(hints),
};
