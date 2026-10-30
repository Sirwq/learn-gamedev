import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../16-sounds/reference/Player.ts?raw";
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "18. Short and long jumps",
  concept: "Input.GetKeyUp and jump height",
  explanation,
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Wall", x: 320, y: 40, w: 130, h: 50, color: "#888" },
      { tag: "Spikes", x: 310, y: 153, w: 90, h: 18, color: "#ccd" },
      { tag: "Platform", x: 600, y: 130, w: 170, h: 20, color: "#a86" },
      { tag: "Flag", x: 700, y: 150, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
    ],
  },
  goals: [{ message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) }],
  lose: [
    { message: "You touched the spikes. Press Run to try again.", test: (world) => world.some((box) => box.tag === "Spikes" && overlaps(find(world, "Player"), box)) },
    offScreen,
  ],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
