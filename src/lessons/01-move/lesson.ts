import type { Lesson } from "../../lesson";
import { find, overlaps } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import stub from "./stub/Player.ts?raw";
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "1. Move right",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Flag", x: 820, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  goals: [{ message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [],
  scripts: { Player: { stub: withNoteComment(stub), reference } },
};
