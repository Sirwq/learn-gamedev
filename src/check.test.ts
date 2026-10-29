import { describe, expect, it } from "vitest";
import { cardStates, checker, currentLesson, isPassed, markPassed, progress, referenceFor, unlocked } from "./check";
import type { World } from "./engine";
import type { Lesson } from "./lesson";

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

  it("never passes without Goals, so a Sandbox Run plays until Stop", () => {
    expect(checker({ goals: [], lose: [] })(at(0))).toEqual({ met: [], passed: false });
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

  it("passes the seconds since the Run started, one frame per call", () => {
    const check = checker({ goals: [], lose: [{ message: "Too slow", test: (_, time) => time > 0.05 }] });
    expect(check(at(0)).lost).toBeUndefined(); // 1/60 s
    check(at(0)); check(at(0));
    expect(check(at(0)).lost).toBe("Too slow"); // 4/60 s
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

describe("progress", () => {
  it("marks the passed Lessons, in Course order", () => {
    const store = new Map<string, string>();
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    markPassed("Speed", s);
    expect(progress([{ title: "Move" }, { title: "Speed" }], s)).toEqual([false, true]);
  });
});

const memStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const ref = (reference: string) => ({ stub: "", reference });
const lessons: Pick<Lesson, "title" | "scripts">[] = [
  { title: "1", scripts: { Player: ref("player 1") } },
  { title: "2", scripts: { Bullet: ref("bullet 2") } },
  { title: "3", scripts: { Player: ref("player 3"), Bullet: ref("bullet 3") } },
];

describe("referenceFor", () => {
  it("is locked until a Lesson with that Script is passed", () => {
    const s = memStore();
    markPassed("2", s);
    expect(referenceFor(lessons, "Player", s)).toBeUndefined();
  });
  it("loads the snapshot from the latest passed Lesson that has that Script", () => {
    const s = memStore();
    markPassed("1", s);
    markPassed("2", s);
    expect(referenceFor(lessons, "Player", s)).toBe("player 1");
    expect(referenceFor(lessons, "Bullet", s)).toBe("bullet 2");
    markPassed("3", s);
    expect(referenceFor(lessons, "Player", s)).toBe("player 3");
  });
});

describe("unlocked", () => {
  it("opens Lesson 1, and the next Lesson only after passing the one before", () => {
    const s = memStore();
    expect([0, 1, 2].map((i) => unlocked(lessons, i, s))).toEqual([true, false, false]);
    expect([-1, 3].map((i) => unlocked(lessons, i, s))).toEqual([false, false]);
    markPassed("1", s);
    expect([0, 1, 2].map((i) => unlocked(lessons, i, s))).toEqual([true, true, false]);
  });
});

describe("Course menu cards", () => {
  it("are passed, current (the first not passed) or locked", () => {
    const s = memStore();
    expect(cardStates(lessons, s)).toEqual(["current", "locked", "locked"]);
    expect(currentLesson(lessons, s)).toBe(0);
    markPassed("1", s);
    expect(cardStates(lessons, s)).toEqual(["passed", "current", "locked"]);
    expect(currentLesson(lessons, s)).toBe(1);
  });
  it("are all passed at the end, the last Lesson staying current", () => {
    const s = memStore();
    for (const l of lessons) markPassed(l.title, s);
    expect(cardStates(lessons, s)).toEqual(["passed", "passed", "passed"]);
    expect(currentLesson(lessons, s)).toBe(2);
  });
});
