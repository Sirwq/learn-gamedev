import type { Lesson } from "../../lesson";
import { find, offScreen, splitHints } from "../../lesson";
import { Time } from "../../engine";
import explanation from "./explanation.md?raw";
import hints from "./hints.md?raw";
import stub from "../14-health/reference/Player.ts?raw";
import reference from "./reference/Player.ts?raw";

export const coinLevel: Lesson["level"] = {
  boxes: [
    { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "orange", script: "Player" },
    { tag: "Wall", x: -80, y: 40, w: 80, h: 300, color: "#888" },
    { tag: "Coin", x: 190, y: 50, w: 20, h: 20, color: "gold" },
    { tag: "Coin", x: 290, y: 50, w: 20, h: 20, color: "gold" },
    { tag: "Coin", x: 390, y: 50, w: 20, h: 20, color: "gold" },
    { tag: "Coin", x: 490, y: 50, w: 20, h: 20, color: "gold" },
    { tag: "Platform", x: 610, y: 100, w: 130, h: 20, color: "#a86" },
    { tag: "Coin", x: 650, y: 150, w: 20, h: 20, color: "gold" },
    { tag: "Flag", x: 890, y: 40, w: 24, h: 64, color: "gold" },
    { tag: "Ground", x: -480, y: 0, w: 1440, h: 40, color: "#5a3" },
  ],
};

function soundOnEvent(clip: "Jump" | "Coin", value: (world: Parameters<Lesson["goals"][number]["test"]>[0]) => number, happened: (before: number, now: number) => boolean, onStart = false) {
  let previous: number | undefined;
  let pending = false;
  let wasHappening = false;
  return (world: Parameters<Lesson["goals"][number]["test"]>[0], time: number) => {
    if (time <= Time.deltaTime) { previous = undefined; pending = false; wasHappening = false; }
    const now = value(world);
    const happening = previous !== undefined && happened(previous, now);
    const event = happening && (!onStart || !wasHappening);
    const matched = (event || pending) && world.sounds.includes(clip);
    pending = event;
    wasHappening = happening;
    previous = now;
    return matched;
  };
}

export const lesson: Lesson = {
  title: "16. Sounds",
  concept: "this.audio.PlayOneShot",
  explanation,
  level: coinLevel,
  goals: [
    { message: "Play Jump when you jump", test: soundOnEvent("Jump", (world) => find(world, "Player").y, (before, now) => now > before, true) },
    { message: "Play Coin when you pick up a coin", test: soundOnEvent("Coin", (world) => world.filter((box) => box.tag === "Coin").length, (before, now) => now < before) },
    { message: "Collect all coins", test: (world) => !world.some((box) => box.tag === "Coin") },
  ],
  lose: [offScreen],
  scripts: { Player: { stub, reference } },
  hints: splitHints(hints),
};
