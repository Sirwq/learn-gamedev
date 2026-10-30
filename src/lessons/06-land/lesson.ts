import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../05-jump/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "6. Land on a box",
  concept: "functions",
  explanation,
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Box", x: 440, y: 120, w: 40, h: 40, color: "#a86" },
      { tag: "Flag", x: 468, y: 230, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  // The flag is out of reach from the ground: only a jump from the box gets there.
  goals: [{ message: "Jump from the box to the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [offScreen],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
