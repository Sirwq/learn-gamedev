import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import stub from "../07-platforms/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "8. Walls",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: 300, y: 40, w: 80, h: 70, color: "#888" },
      { tag: "Wall", x: 380, y: 40, w: 80, h: 160, color: "#888" },
      { tag: "Flag", x: 408, y: 200, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  goals: [{ message: "Climb the walls to the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [
    offScreen,
    {
      message: "You went inside a wall. Press Run to try again.",
      test: (world) => world.some((o) => o.tag === "Wall" && overlaps(find(world, "Player"), o)),
    },
  ],
  scripts: { Player: { stub: withNoteComment(stub), reference } },
};
