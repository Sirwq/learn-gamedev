import type { Lesson } from "../../lesson";
import { offScreen, splitHints } from "../../lesson";
import { withNoteBox } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../09-camera/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";

export const lesson: Lesson = {
  title: "10. Coins",
  concept: "Destroy and Debug.Log",
  explanation: withNoteBox(explanation),
  level: {
    width: 2400,
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Coin", x: 400, y: 50, w: 20, h: 20, color: "gold" },
      { tag: "Coin", x: 700, y: 50, w: 20, h: 20, color: "gold" },
      { tag: "Platform", x: 1000, y: 120, w: 160, h: 20, color: "#a86" },
      { tag: "Coin", x: 1070, y: 200, w: 20, h: 20, color: "gold" },
      { tag: "Coin", x: 1500, y: 50, w: 20, h: 20, color: "gold" },
      { tag: "Coin", x: 1900, y: 50, w: 20, h: 20, color: "gold" },
      { tag: "Ground", x: -480, y: 0, w: 2880, h: 40, color: "#5a3" },
    ],
  },
  // Walking through a coin is not enough: it has to be Destroyed. The coin above the platform is out of reach from the ground.
  goals: [{ message: "Collect all coins", test: (world) => !world.some((o) => o.tag === "Coin") }],
  lose: [offScreen],
  scripts: { Player: { stub: stub, reference } },
  hints: splitHints(hints),
};
