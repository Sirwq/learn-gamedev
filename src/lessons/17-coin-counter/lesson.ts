import type { Lesson } from "../../lesson";
import { offScreen, splitHints } from "../../lesson";
import { Time } from "../../engine";
import { coinLevel } from "../16-sounds/lesson";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "./stub/HUD.ts?raw";
import reference from "./reference/HUD.ts?raw";

const totalCoins = coinLevel.boxes.filter((box) => box.tag === "Coin").length;
let shown = new Set<number>();

export const lesson: Lesson = {
  title: "17. Coin counter",
  concept: "OnGUI and GUI.Label",
  explanation,
  level: { ...coinLevel, boxes: [...coinLevel.boxes, { tag: "HUD", x: 0, y: 0, w: 1, h: 1, color: "transparent", script: "HUD" }] },
  goals: [
    {
      message: "Show your coins on screen",
      test: (world, time) => {
        if (time <= Time.deltaTime) shown = new Set<number>();
        const count = totalCoins - world.filter((box) => box.tag === "Coin").length;
        if (world.labels.some((label) => label.text === `Coins: ${count}` && label.x >= 0 && label.y >= 0 && label.w > 0 && label.h > 0 && label.x + label.w <= 960 && label.y + label.h <= 540)) shown.add(count);
        return shown.size >= 2;
      },
    },
    { message: "Collect all coins", test: (world) => !world.some((box) => box.tag === "Coin") },
  ],
  lose: [offScreen],
  scripts: { HUD: { stub, reference } },
  hints: splitHints(hints),
};
