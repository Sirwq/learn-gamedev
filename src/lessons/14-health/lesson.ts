import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { Time } from "../../engine";
import { withNoteBox } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../13-shoot/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

const start = { x: 100, y: 40 };
let lastX = start.x; // the Player's x on the previous frame of this Run

export const lesson: Lesson = {
  title: "14. Health and respawn",
  concept: "Start()",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", ...start, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Spikes", x: 400, y: 40, w: 80, h: 16, color: "#ccd" },
      { tag: "Flag", x: 800, y: 40, w: 24, h: 64, color: "gold" },
      { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
    ],
  },
  goals: [
    {
      // A respawn is a jump back to the start in one frame; walking back takes many.
      message: "Get hurt and go back to the start",
      test: (world, time) => {
        const { x } = find(world, "Player");
        const was = time === Time.deltaTime ? x : lastX;
        lastX = x;
        return x === start.x && was - x > 100;
      },
    },
    { message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) },
  ],
  // The respawn happens in the same frame as the touch, so the spikes only see you if you didn't go back.
  lose: [
    { message: "You ran out of health. Press Run to try again.", test: (world) => !world.some((o) => o.tag === "Player") },
    offScreen,
    {
      message: "You stood in the spikes. Go back to the start when they hurt you. Press Run to try again.",
      test: (world) => world.some((o) => o.tag === "Spikes" && overlaps(find(world, "Player"), o)),
    },
  ],
  scripts: { Player: { stub: stub, reference } },
  hints: splitHints(hints),
};
