import { describe, expect, it } from "vitest";
import { course } from "./course";
import { api, scriptSource, startGame, worldView, type MonoBehaviour } from "../engine";
import { transpile } from "../run-utils";

// Headless stand-in for the worker's blob import: evaluate the Script with the student API in scope.
const load = (ts: string, name: string) =>
  new Function(...Object.keys(api), scriptSource(transpile(ts), name).replace("export const __script =", "return"))(
    ...Object.values(api),
  ) as new () => MonoBehaviour;

describe.each(course.map((l) => [l.title, l] as const))("Lesson %s", (_, lesson) => {
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

  // Frames until every Goal holds, or 601 if not within 10 simulated seconds.
  const framesToPass = (code: "stub" | "reference") => {
    const classes = Object.fromEntries(Object.entries(lesson.scripts).map(([n, s]) => [n, load(s[code], n)]));
    const game = startGame(lesson.level.boxes, classes);
    let frame = 0;
    while (frame++ < 600 && !lesson.goals.every((g) => g.test(worldView(game.objects)))) game.step();
    return frame;
  };

  it("is passed by its Reference code within 10 simulated seconds, and not by the stub", () => {
    expect(framesToPass("reference")).toBeLessThanOrEqual(600);
    expect(framesToPass("stub")).toBe(601);
  });
});
