import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { Time } from "../../engine";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../19-coyote/reference/Player.ts?raw";
import reference from "./reference/Player.ts?raw";

function bufferedLanding() {
  let previousY: number | undefined;
  let previousStep = 0;
  let previousSupported = false;
  let pressedAt: number | undefined;
  let landedAt: number | undefined;
  let previousEnemies: number | undefined;
  return (world: Parameters<Lesson["goals"][number]["test"]>[0], time: number) => {
    if (time <= Time.deltaTime) { previousY = undefined; previousStep = 0; previousSupported = false; pressedAt = undefined; landedAt = undefined; previousEnemies = undefined; }
    const player = find(world, "Player");
    const enemies = world.filter((box) => box.tag === "Enemy").length;
    const stomped = previousEnemies !== undefined && enemies < previousEnemies;
    const step = previousY === undefined ? 0 : player.y - previousY;
    const supported = world.some((box) => ["Ground", "Platform", "Wall"].includes(box.tag)
      && player.x < box.x + box.w && player.x + player.w > box.x
      && Math.abs(player.y - box.y - box.h) < 2);
    if (world.keysDown.has("Space") && step < 0 && !supported) pressedAt = time;
    if (supported && !previousSupported && !stomped && pressedAt !== undefined && time - pressedAt <= 0.1 + 0.0001) landedAt = time;
    const kick = previousY !== undefined && step - previousStep > 3 && step > 0;
    const good = !stomped && landedAt !== undefined && kick && time - landedAt <= Time.deltaTime + 0.0001;
    if (landedAt !== undefined && time - landedAt > Time.deltaTime + 0.0001) landedAt = undefined;
    previousY = player.y;
    previousStep = step;
    previousSupported = supported;
    previousEnemies = enemies;
    return good;
  };
}

export const lesson: Lesson = {
  title: "20. Jump buffering",
  concept: "remembering a press",
  explanation,
  level: { boxes: [
    { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
    { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
    { tag: "Platform", x: 300, y: 65, w: 100, h: 20, color: "#a86" },
    { tag: "Platform", x: 500, y: 90, w: 100, h: 20, color: "#a86" },
    { tag: "Flag", x: 880, y: 40, w: 24, h: 64, color: "gold" },
    { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
  ] },
  goals: [
    { message: "Press jump just before you land", test: bufferedLanding() },
    { message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) },
  ],
  lose: [offScreen],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
