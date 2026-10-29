import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { withNoteBox, withNoteComment } from "../ai-note";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../12-stomp/reference/Player.ts?raw"; // code carries over: the Lesson starts from the last one's Reference code
import reference from "./reference/Player.ts?raw";
import bulletStub from "./stub/Bullet.ts?raw";
import bulletReference from "./reference/Bullet.ts?raw";

export const lesson: Lesson = {
  title: "13. Shooting",
  explanation: withNoteBox(explanation),
  level: {
    boxes: [
      { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Enemy", x: 450, y: 40, w: 60, h: 260, color: "crimson" },
      { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
    ],
  },
  // Its middle (y 170) is above the top of a jump (y 160), so a stomp can't work.
  goals: [{ message: "Shoot the enemy", test: (world) => !world.some((o) => o.tag === "Enemy") }],
  lose: [
    offScreen,
    {
      message: "The enemy hurt you. It's too tall to stomp: shoot it. Press Run to try again.",
      test: (world) => world.some((o) => o.tag === "Enemy" && overlaps(find(world, "Player"), o)),
    },
  ],
  scripts: {
    Player: { stub: withNoteComment(stub), reference },
    Bullet: { stub: withNoteComment(bulletStub), reference: bulletReference },
  },
  hints: splitHints(hints),
};
