import { describe, expect, it } from "vitest";
import { course } from "./course";
import { Camera, keyEvent, KeyCode, keysDown, labels, releaseAllKeys, startGame, takeSounds, Vector2, worldView } from "../engine";
import { loadScript } from "../test-helpers";
import { checker } from "../check";
import { achievementChecker, achievements } from "../achievements";
import lesson15Player from "./14-health/reference/Player.ts?raw";

it("includes Sounds and Coin counter, with Lesson 15 Player as Sounds' hidden stub", () => {
  expect(course.slice(15, 17).map((lesson) => lesson.title)).toEqual(["16. Sounds", "17. Coin counter"]);
  expect(course[15].scripts.Player.stub).toBe(lesson15Player);
});

it("includes the game feel Lessons", () => {
  expect(course.slice(17).map((lesson) => lesson.title)).toEqual(["18. Short and long jumps", "19. Coyote time", "20. Jump buffering", "21. Screen shake"]);
});

it("accepts Jump on the first rising frame or the next, including a slow rise", () => {
  const lesson = course[15];
  const jumpMet = (frames: { y: number; sound?: boolean }[]) => {
    const check = checker(lesson);
    return frames.map(({ y, sound }) => {
      const world = lesson.level.boxes.map((box) => box.tag === "Player" ? { ...box, y } : box);
      return check(world, { sounds: sound ? ["Jump"] : [] }).met[0];
    });
  };
  expect(jumpMet([{ y: 40 }, { y: 41, sound: true }])).toEqual([false, true]);
  expect(jumpMet([{ y: 40 }, { y: 41 }, { y: 42, sound: true }])).toEqual([false, false, true]);
  expect(jumpMet([{ y: 40 }, { y: 41 }, { y: 42 }, { y: 43, sound: true }])).toEqual([false, false, false, false]);
});

it("counts a buffered landing, but not a stomp bounce", () => {
  const lesson = course[19];
  const run = (stomp: boolean) => {
    const check = checker(lesson);
    return [70, 55, 40, 50].map((y, i) => {
      const world = lesson.level.boxes.map((box) => box.tag === "Player" ? { ...box, y } : box);
      if (stomp && i < 2) world.push({ tag: "Enemy", x: 100, y: 40, w: 32, h: 32, color: "red" });
      return check(world, { keysDown: new Set(i === 1 ? [KeyCode.Space] : []) }).met[0];
    });
  };
  expect(run(false)).toEqual([false, false, false, true]);
  expect(run(true)).toEqual([false, false, false, false]);
});

it("accepts a quick shake after Hurt, but not a sound before the respawn", () => {
  const lesson = course[20];
  const run = (hurtFrame: number) => {
    const check = checker(lesson);
    return [350, 100, 100, 100, 100, 100].map((x, i) => {
      Camera.main.transform.position = new Vector2(x + [0, 6, -6, 6, -6, 0][i], 270);
      const world = lesson.level.boxes.map((box) => box.tag === "Player" ? { ...box, x } : box);
      return check(world, { sounds: i === hurtFrame ? ["Hurt"] : [] }).met[0];
    });
  };
  expect(run(1)).toEqual([false, false, false, false, false, true]);
  expect(run(2)).toEqual([false, false, false, false, false, true]);
  expect(run(0)).toEqual([false, false, false, false, false, false]);
  expect(run(3)).toEqual([false, false, false, false, false, false]);
});


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
  "16. Sounds": (f) => (f === 70 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
  "17. Coin counter": (f) => (f === 70 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow]),
  "18. Short and long jumps": (f) =>
    f >= 22 && f <= 26 || f >= 48 && f <= 90 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow],
  "19. Coyote time": (f) =>
    f === 41 || f >= 63 && f <= 110 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow],
  "20. Jump buffering": (f) => f === 16 || f === 36 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow],
  "21. Screen shake": (f) => f === 80 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow],
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
  const framesToPass = (code: Record<string, string>, earned = new Set<string>(), keysOn = play[lesson.title] ?? (() => []), onLose?: (message: string) => void) => {
    const classes = Object.fromEntries(Object.entries(code).map(([n, s]) => [n, loadScript(s, n)]));
    const game = startGame(lesson.level.boxes, classes);
    const check = checker(lesson);
    const checkAchievements = achievementChecker(lesson.level.boxes, earned, achievements.map((a) => ({ ...a, after: null })));
    releaseAllKeys();
    let held: string[] = [];
    for (let frame = 1; frame <= 600; frame++) {
      const keys = keysOn(frame);
      for (const k of held) if (!keys.includes(k)) keyEvent(k, false);
      for (const k of keys) keyEvent(k, true);
      held = keys;
      game.step();
      const world = worldView(game.objects);
      const result = check(world, { keysDown: keysDown(), sounds: takeSounds(), labels });
      checkAchievements(world, { keysDown: keysDown() });
      if (result.lost) { onLose?.(result.lost); break; }
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

  it.runIf(lesson.title === "19. Coyote time")("allows a real mid-air double jump", () => {
    const player = lesson.scripts.Player.reference
      .replace("  coyote = 0;", "  coyote = 0;\n  doubleJumpUsed = false;")
      .replace("  Update() {", `  Update() {
    if (Input.GetKeyDown(KeyCode.Space) && this.transform.position.x > 650 && !this.onGround && !this.doubleJumpUsed) {
      this.velocityY = this.jumpSpeed;
      this.doubleJumpUsed = true;
    }`);
    const keys = (f: number) => [
      ...(f <= 105 || f >= 151 ? [KeyCode.RightArrow] : []),
      ...(f === 63 || f === 80 ? [KeyCode.Space] : []),
    ];
    expect(framesToPass({ ...earlier, Player: player }, new Set(), keys)).toBeLessThanOrEqual(600);
  });

  it.runIf(lesson.title === "19. Coyote time")("rejects the old Player's late jump after walking off", () => {
    let lost = "";
    framesToPass(earlier, new Set(), play[lesson.title], (message) => { lost = message; });
    expect(lost).toContain("long after leaving the edge");
  });

  it.runIf(lesson.title === "18. Short and long jumps")("loses when a full jump hits the overhead spikes", () => {
    let lost = "";
    const fullJump = (f: number) => f >= 22 && f <= 90 ? [KeyCode.RightArrow, KeyCode.Space] : [KeyCode.RightArrow];
    framesToPass({ ...earlier, Player: lesson.scripts.Player.reference }, new Set(), fullJump, (message) => { lost = message; });
    expect(lost).toContain("spikes");
  });
});
