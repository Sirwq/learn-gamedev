import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { Time } from "../../engine";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../18-short-long/reference/Player.ts?raw";
import reference from "./reference/Player.ts?raw";

const supports = (world: Parameters<Lesson["goals"][number]["test"]>[0]) => {
  const player = find(world, "Player");
  return world.some((box) => ["Ground", "Platform", "Wall"].includes(box.tag)
    && player.x < box.x + box.w && player.x + player.w > box.x
    && Math.abs(player.y - box.y - box.h) < 2);
};

function edgeJump() {
  let previousY: number | undefined;
  let previousStep = 0;
  let wasSupported = false;
  let leftAt: number | undefined;
  let pressedAt: number | undefined;
  let lastTime = 0;
  let good = false;
  let late = false;
  return (world: Parameters<Lesson["goals"][number]["test"]>[0], time: number) => {
    if (time <= Time.deltaTime) {
      previousY = undefined;
      previousStep = 0;
      wasSupported = false;
      leftAt = undefined;
      pressedAt = undefined;
      good = false;
      late = false;
      lastTime = 0;
    }
    if (time === lastTime) return { good, late };
    lastTime = time;
    const y = find(world, "Player").y;
    const supported = supports(world);
    const step = previousY === undefined ? 0 : y - previousY;
    if (wasSupported && !supported && step <= 0) leftAt = time;
    if (supported) { leftAt = undefined; pressedAt = undefined; }
    if (leftAt !== undefined && world.keysDown.has("Space")) pressedAt = time;
    const kick = previousY !== undefined && step - previousStep > 3 && step > 0;
    if (kick && leftAt !== undefined) {
      const delay = time - leftAt;
      good ||= pressedAt !== undefined && pressedAt - leftAt >= 0.02 - 0.0001 && pressedAt - leftAt <= 0.1 + 0.0001 && time - pressedAt <= 2 * Time.deltaTime;
      late ||= delay > 0.25;
      leftAt = undefined;
      pressedAt = undefined;
    }
    previousY = y;
    previousStep = step;
    wasSupported = supported;
    return { good, late };
  };
}

const edge = edgeJump();
export const lesson: Lesson = {
  title: "19. Coyote time",
  concept: "a timer field",
  explanation,
  level: {
    boxes: [
      { tag: "Player", x: 150, y: 150, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
      { tag: "Water", x: 0, y: 0, w: 300, h: 20, color: "#36c" },
      { tag: "Platform", x: 0, y: 130, w: 300, h: 20, color: "#a86" },
      { tag: "Ground", x: 300, y: 0, w: 240, h: 40, color: "#5a3" },
      { tag: "Water", x: 540, y: 0, w: 420, h: 20, color: "#36c" },
      { tag: "Platform", x: 750, y: 40, w: 210, h: 20, color: "#a86" },
      { tag: "Flag", x: 875, y: 60, w: 24, h: 64, color: "gold" },
    ],
  },
  goals: [
    { message: "Jump just after running off an edge", test: (world, time) => edge(world, time).good },
    { message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) },
  ],
  lose: [
    { message: "You jumped long after leaving the edge. Press Run to try again.", test: (world, time) => edge(world, time).late },
    { message: "You fell in the water. Press Run to try again.", test: (world) => overlaps(find(world, "Player"), find(world, "Water")) },
    offScreen,
  ],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
