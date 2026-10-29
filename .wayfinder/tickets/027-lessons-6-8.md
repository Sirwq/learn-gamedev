---
title: Write Lessons 6–8 (land on a box, many platforms, walls)
label: build
status: closed
blocked_by: [026-lessons-2-5]
assignee:
---

## What

Same format and rules as ticket 026, for:

| # | Mechanic | New concept |
|---|---|---|
| 6 | Land on a box | functions (student writes `Overlaps(a, b)`) |
| 7 | Many platforms | arrays + `for` loop |
| 8 | Walls (side collision) | `else if` |

Levels still fit one screen. Guidance starts shrinking.

## Spec

- [005-first-course.md](005-first-course.md)

## Done when

- Same tests as 026: Reference code passes each Lesson, the previous Lesson's Reference code does not.
- `npm run typecheck` and `npm test` pass.

## Resolution

- Lesson folders `src/lessons/06-land`, `07-platforms`, `08-walls` (lesson.ts, explanation.md with a "Differs from Unity C#" note, reference/Player.ts), added to `course.ts`. As in 026, each stub is the previous Lesson's Reference code, imported.
- New student typings: `GameObject.w` and `GameObject.h` (the runtime already had them). `Overlaps(a, b)` needs a box's size. Unity reads that from a collider, and the doc comment says so.
- Level design: **6** a floating platform with a flag above it, out of reach from the ground. You jump up through the platform (it only catches you while falling) and jump again from it. **7** three platforms like stairs, each in reach only from the one below, and the flag only from the top one, so landing on `[0]` alone is not enough. **8** a low and a tall Wall, with the flag on the tall one. A Lose event fires when you overlap a Wall, so walls must be solid. The Lesson 7 code walks straight into one.
- Lesson 8 Reference: after the arrow keys, an `if` pressing right / `else if` pressing left pushes you out of a wall. Walls join the landing loop through `.concat(walls)`.
- Guidance shrinks: Lesson 6 gives half of the `Overlaps` line. Lessons 7 and 8 describe the steps and give only the shape of the loop and the `else if`.
- Tests: key plans for 6–8 in `course.test.ts`. A new `engine.test.ts` check type-checks every Lesson's Reference code against the student typings.
- Known gap: `onGround` stays true after you walk off a platform, so you can jump once in mid-air. No Level depends on it. A later Lesson could fix it.
- Not checked in a browser: the jump distances were only checked with the headless runs.
