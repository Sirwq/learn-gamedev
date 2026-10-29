import { describe, expect, it } from "vitest";
import { course } from "./course";
import { keyEvent, KeyCode, keysDown, releaseAllKeys, startGame, worldView } from "../engine";
import { loadScript } from "../test-helpers";
import { checker } from "../check";
import { achievementChecker, achievements } from "../achievements";


// Keys a player holds on each frame to pass a Lesson with its Reference code.
const play: Record<string, (frame: number) => string[]> = {
  "3. Steer": (f) => [f <= 60 ? KeyCode.LeftArrow : KeyCode.RightArrow],
  "4. Gravity": () => [KeyCode.RightArrow],
  "5. Jump": (f) => (f === 30 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
  // Walk under the box, jump onto it, jump to the flag.
  "6. Land on a box": (f) => (f <= 55 ? [KeyCode.RightArrow] : f === 56 || f === 120 ? [KeyCode.Space] : []),
  // Jump onto the first platform, then two running jumps up the stairs, then up to the flag.
  "7. Many platforms": (f) =>
    f <= 22 ? [KeyCode.RightArrow]
    : f === 23 || f === 200 ? [KeyCode.Space]
    : f === 78 || f === 138 ? [KeyCode.RightArrow, KeyCode.Space]
    : (f >= 70 && f < 100) || (f >= 130 && f < 166) ? [KeyCode.RightArrow]
    : [],
  // Run into the low wall, jump onto it, jump onto the tall one.
  "8. Walls": (f) => (f === 31 || f === 75 ? [KeyCode.RightArrow, KeyCode.Space] : f <= 95 ? [KeyCode.RightArrow] : []),
  // Run right past the first screen, jumping the low wall.
  "9. Camera follow": (f) => (f === 145 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
  // Run right, jump onto the platform, jump from it for the high coin.
  "10. Coins": (f) => (f === 100 || f === 140 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
  // Lesson 11 needs no keys: the enemy patrols while you stand still.
  // A running jump over the low wall comes down on the enemy.
  "12. Stomp": (f) => (f === 10 ? [KeyCode.RightArrow, KeyCode.Space] : f <= 60 ? [KeyCode.RightArrow] : []),
  "13. Shooting": (f) => (f === 10 ? [KeyCode.S] : []),
  // Walk into the spikes, then a running jump over them to the flag.
  "14. Health and respawn": (f) => (f === 80 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
  // A running jump onto the platform, stand still while it crosses the water, then jump off to the flag.
  "15. Moving platforms": (f) =>
    f === 3 || f === 345 ? [KeyCode.RightArrow, KeyCode.Space] : f <= 40 || f > 345 ? [KeyCode.RightArrow] : [],
};

// Achievements each Lesson's playthrough should earn, every one checked as if unlocked.
const earns: Record<string, string[]> = {
  "3. Steer": ["steps", "both"],
  "5. Jump": ["jump"],
  "6. Land on a box": ["land"],
  "7. Many platforms": ["hop"],
  "8. Walls": ["bonk"],
  "9. Camera follow": ["explore"],
  "10. Coins": ["coin", "allcoins"],
  "11. Enemy patrol": ["patrol"],
  "12. Stomp": ["stomp"],
  "13. Shooting": ["pew", "snipe"],
  "14. Health and respawn": ["respawn"],
  "15. Moving platforms": ["ride"],
};

describe.each(course.map((l, i) => [l.title, l, i] as const))("Lesson %s", (_, lesson, index) => {
  it("is complete", () => {
    expect(lesson.title).not.toBe("");
    expect(lesson.explanation).not.toBe("");
    expect(lesson.level.boxes.filter((b) => b.script === "Player")).toHaveLength(1);
    expect(lesson.goals.length).toBeGreaterThan(0);
    const scripts = course.slice(0, index + 1).flatMap((l) => Object.keys(l.scripts)); // Scripts carry over
    for (const box of lesson.level.boxes) if (box.script) expect(scripts).toContain(box.script);
    for (const { stub, reference } of Object.values(lesson.scripts)) {
      expect(stub.trim()).not.toBe("");
      expect(reference.trim()).not.toBe("");
    }
  });

  // Frames until the Lesson passes, or 601 if not within 10 simulated seconds or on a Lose event.
  const framesToPass = (code: Record<string, string>, earned = new Set<string>(), keysOn = play[lesson.title] ?? (() => [])) => {
    const classes = Object.fromEntries(Object.entries(code).map(([n, s]) => [n, loadScript(s, n)]));
    const game = startGame(lesson.level.boxes, classes);
    const check = checker(lesson);
    const checkAchievements = achievementChecker(lesson.level.boxes, earned, achievements.map((a) => ({ ...a, after: null })));
    releaseAllKeys();
    let held: string[] = [];
    for (let frame = 1; frame <= 600; frame++, game.step()) {
      const keys = keysOn(frame);
      for (const k of held) if (!keys.includes(k)) keyEvent(k, false);
      for (const k of keys) keyEvent(k, true);
      held = keys;
      const result = check(worldView(game.objects));
      checkAchievements(worldView(game.objects), { keysDown: keysDown() });
      if (result.lost) break;
      if (result.passed) return frame;
    }
    return 601;
  };

  const code = (lessons: typeof course, kind: "stub" | "reference") =>
    Object.fromEntries(lessons.flatMap((l) => Object.entries(l.scripts).map(([n, s]) => [n, s[kind]])));

  // Earlier Lessons' Scripts carry over, as the student's own code would.
  const earlier = code(course.slice(0, index), "reference");
  it("is passed by its Reference code within 10 simulated seconds, and not by the stub", () => {
    expect(framesToPass({ ...earlier, ...code([lesson], "reference") })).toBeLessThanOrEqual(600);
    expect(framesToPass({ ...earlier, ...code([lesson], "stub") })).toBe(601);
  });

  it.runIf(lesson.title in earns)("earns its Achievements when played with its Reference code", () => {
    const earned = new Set<string>();
    framesToPass({ ...earlier, ...code([lesson], "reference") }, earned);
    expect([...earned]).toEqual(expect.arrayContaining(earns[lesson.title]));
  });

  // The Course's Players stomp, respawn, ride and run, but have no Extra moves.
  it("earns no Mechanic Achievement with its Reference code", () => {
    const plan = play[lesson.title] ?? (() => []);
    const mash = (f: number) => (f % 2 ? [...plan(f), KeyCode.Space] : plan(f));
    const extras = (keys: typeof plan) => {
      const earned = new Set<string>();
      framesToPass({ ...earlier, ...code([lesson], "reference") }, earned, keys);
      return ["doublejump", "walljump", "dash"].filter((id) => earned.has(id));
    };
    expect(extras(plan)).toEqual([]);
    // Space every other frame: a Player whose onGround outlives a walk off a ledge can jump once in mid-air, a Double jump by the spec's test.
    expect(extras(mash).filter((id) => id !== "doublejump")).toEqual([]);
  });

  it.runIf(index > 0)("is not passed by the previous Lesson's Reference code", () => {
    expect(framesToPass({ ...code([lesson], "stub"), ...earlier })).toBe(601);
  });
});
