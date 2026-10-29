import { describe, expect, it } from "vitest";
import { course } from "./course";
import { api, keyEvent, KeyCode, releaseAllKeys, scriptSource, startGame, worldView, type MonoBehaviour } from "../engine";
import { transpile } from "../run-utils";
import { checker } from "../check";

// Headless stand-in for the worker's blob import: evaluate the Script with the student API in scope.
const load = (ts: string, name: string) =>
  new Function(...Object.keys(api), scriptSource(transpile(ts), name).replace("export const __script =", "return"))(
    ...Object.values(api),
  ) as new () => MonoBehaviour;

// Keys a player holds on each frame to pass a Lesson with its Reference code.
const play: Record<string, (frame: number) => string[]> = {
  "3. Steer": (f) => [f <= 60 ? KeyCode.LeftArrow : KeyCode.RightArrow],
  "4. Gravity": () => [KeyCode.RightArrow],
  "5. Jump": (f) => (f === 30 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
};

describe.each(course.map((l, i) => [l.title, l, i] as const))("Lesson %s", (_, lesson, index) => {
  it("is complete", () => {
    expect(lesson.title).not.toBe("");
    expect(lesson.explanation).not.toBe("");
    expect(lesson.level.boxes.filter((b) => b.script === "Player")).toHaveLength(1);
    expect(lesson.goals.length).toBeGreaterThan(0);
    for (const box of lesson.level.boxes) if (box.script) expect(Object.keys(lesson.scripts)).toContain(box.script);
    for (const { stub, reference } of Object.values(lesson.scripts)) {
      expect(stub.trim()).not.toBe("");
      expect(reference.trim()).not.toBe("");
    }
  });

  // Frames until the Lesson passes, or 601 if not within 10 simulated seconds or on a Lose event.
  const framesToPass = (code: Record<string, string>) => {
    const classes = Object.fromEntries(Object.entries(code).map(([n, s]) => [n, load(s, n)]));
    const game = startGame(lesson.level.boxes, classes);
    const check = checker(lesson);
    releaseAllKeys();
    let held: string[] = [];
    for (let frame = 1; frame <= 600; frame++, game.step()) {
      const keys = play[lesson.title]?.(frame) ?? [];
      for (const k of held) if (!keys.includes(k)) keyEvent(k, false);
      for (const k of keys) keyEvent(k, true);
      held = keys;
      const result = check(worldView(game.objects));
      if (result.lost) break;
      if (result.passed) return frame;
    }
    return 601;
  };

  const code = (lessons: typeof course, kind: "stub" | "reference") =>
    Object.fromEntries(lessons.flatMap((l) => Object.entries(l.scripts).map(([n, s]) => [n, s[kind]])));

  it("is passed by its Reference code within 10 simulated seconds, and not by the stub", () => {
    expect(framesToPass(code([lesson], "reference"))).toBeLessThanOrEqual(600);
    expect(framesToPass(code([lesson], "stub"))).toBe(601);
  });

  it.runIf(index > 0)("is not passed by the previous Lesson's Reference code", () => {
    expect(framesToPass({ ...code([lesson], "stub"), ...code(course.slice(0, index), "reference") })).toBe(601);
  });
});
