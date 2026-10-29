import type { World } from "../../engine";
import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../02-speed/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

const flag = (world: World, side: number) => world.filter((o) => o.tag === "Flag")[side];

export const lesson: Lesson = {
  title: "3. Steer",
  concept: "if and Input.GetKey",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 464, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Flag", x: 60, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Flag", x: 880, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  goals: [
    { message: "Touch the left flag", test: (world) => overlaps(find(world, "Player"), flag(world, 0)) },
    { message: "Touch the right flag", test: (world) => overlaps(find(world, "Player"), flag(world, 1)) },
  ],
  lose: [offScreen],
  scripts: { Player: { stub: withNoteComment(stub), reference } },
  hints: splitHints(hints),
};
