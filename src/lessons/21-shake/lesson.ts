import type { Lesson } from "../../lesson";
import { find, offScreen, overlaps, splitHints } from "../../lesson";
import { Camera, Time } from "../../engine";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../20-buffer/reference/Player.ts?raw";
import reference from "./reference/Player.ts?raw";

function hurtAndShake() {
  let previousX: number | undefined;
  let hurtAt: number | undefined;
  let soundPending = false;
  let sounded = false;
  let lastSign = 0;
  let flips = 0;
  return (world: Parameters<Lesson["goals"][number]["test"]>[0], time: number) => {
    if (time <= Time.deltaTime) {
      previousX = undefined; hurtAt = undefined; soundPending = false; sounded = false;
      lastSign = 0; flips = 0;
    }
    const player = find(world, "Player");
    const respawn = previousX !== undefined && player.x === 100 && previousX - player.x > 100;
    previousX = player.x;
    if (respawn) {
      hurtAt = time; soundPending = true; sounded = false;
      lastSign = 0; flips = 0;
    }
    if (soundPending && world.sounds.includes("Hurt")) sounded = true;
    soundPending = respawn;
    if (hurtAt === undefined) return false;
    const offset = Camera.main.transform.position.x - player.x;
    if (time - hurtAt <= 0.5 + 0.0001 && Math.abs(offset) >= 2) {
      const sign = Math.sign(offset);
      if (lastSign && sign !== lastSign) flips++;
      lastSign = sign;
    }
    return sounded && flips >= 3 && time - hurtAt <= 1 + 0.0001 && Math.abs(offset) < 2;
  };
}

export const lesson: Lesson = {
  title: "21. Screen shake",
  concept: "camera motion and Hurt",
  explanation,
  level: { boxes: [
    { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
    { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
    { tag: "Spikes", x: 400, y: 40, w: 80, h: 16, color: "#ccd" },
    { tag: "Flag", x: 800, y: 40, w: 24, h: 64, color: "gold" },
    { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
  ] },
  goals: [
    { message: "Get hurt: play Hurt and shake the screen", test: hurtAndShake() },
    { message: "Reach the flag", test: (world) => overlaps(find(world, "Player"), find(world, "Flag")) },
  ],
  lose: [
    { message: "You ran out of health. Press Run to try again.", test: (world) => !world.some((o) => o.tag === "Player") },
    offScreen,
    { message: "You stood in the spikes. Go back to the start when they hurt you. Press Run to try again.", test: (world) => world.some((o) => o.tag === "Spikes" && overlaps(find(world, "Player"), o)) },
  ],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
