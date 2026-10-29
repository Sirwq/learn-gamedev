import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../04-gravity/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "5. Jump",
  concept: "booleans and &&",
  explanation,
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Enemy", x: 440, y: 40, w: 40, h: 40, color: "crimson" },
      { tag: "Flag", x: 820, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: 0, y: 0, w: 960, h: 40, color: "#5a3" },
    ],
  },
  goals: [{ message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [
    offScreen,
    { message: "You touched the enemy. Press Run to try again.", test: (world) => overlaps(find(world, "Player"), find(world, "Enemy")) },
  ],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
