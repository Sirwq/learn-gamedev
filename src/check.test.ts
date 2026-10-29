import { describe, expect, it } from "vitest";
import { checker, isPassed, markPassed } from "./check";
import type { World } from "./engine";

const at = (x: number): World => [{ tag: "Player", x, y: 0, w: 1, h: 1, color: "" }];
const lesson = {
  goals: [
    { message: "Reach 10", test: (w: World) => w[0].x === 10 },
    { message: "Reach 20", test: (w: World) => w[0].x === 20 },
  ],
  lose: [{ message: "Fell", test: (w: World) => w[0].x < 0 }],
};

describe("checker", () => {
  it("passes when every Goal is met in the same Run, even at different frames", () => {
    const check = checker(lesson);
    expect(check(at(10))).toEqual({ met: [true, false], passed: false });
    expect(check(at(20))).toEqual({ met: [true, true], passed: true });
  });

  it("does not pass on Goals met across two Runs", () => {
    checker(lesson)(at(10));
    expect(checker(lesson)(at(20))).toEqual({ met: [false, true], passed: false });
  });

  it("resets every ✓ to ⬜ on a Lose event", () => {
    const check = checker(lesson);
    check(at(10));
    expect(check(at(-1))).toEqual({ met: [false, false], passed: false, lost: "Fell" });
  });
});

describe("passed state", () => {
  it("is saved and reloaded", () => {
    const data = new Map<string, string>();
    const store = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    expect(isPassed("1. Move right", store)).toBe(false);
    markPassed("1. Move right", store);
    expect(isPassed("1. Move right", { getItem: store.getItem })).toBe(true);
    expect(isPassed("2. Jump", store)).toBe(false);
  });
});
