---
title: Write Lessons 2–5 (speed, steer, gravity, jump)
label: build
status: closed
blocked_by: [018-checks, 019-console]
assignee:
---

## What

Lesson folders for Lessons 2–5 of the Course table, each with `lesson.ts`, `explanation.md` (with a "Differs from Unity C#" box), stubs and Reference code:

| # | Mechanic | New concept |
|---|---|---|
| 2 | Speed | fields + `Time.deltaTime`; introduce `Debug.Log` |
| 3 | Steer | `if` + `Input.GetKey` |
| 4 | Gravity | changing a value over time, comparisons |
| 5 | Jump | booleans + `&&` |

Each Level fits one 960×540 screen and its Goal needs the new Mechanic (no anti-cheat; the Level design does the work). Guidance stays high: Explanations give most of the line, stubs are finished methods with a gap. Code carries over: each Lesson starts from the student's own code.

## Spec

- [005-first-course.md](005-first-course.md)
- [004-lesson-format.md](004-lesson-format.md)
- [003-check.md](003-check.md): Goals need the Mechanic

## Done when

- The existing "every Lesson is valid" test covers them.
- For each Lesson a headless test plays its Reference code with scripted key presses and confirms every Goal passes, and that the previous Lesson's Reference code alone does **not** pass it.
- `npm run typecheck` and `npm test` pass.

## Resolution

- Lesson folders `src/lessons/02-speed`, `03-steer`, `04-gravity`, `05-jump`, each with `lesson.ts`, `explanation.md` (with a "Differs from Unity C#" note) and `reference/Player.ts`, added to `course.ts`.
- Each Lesson's Player stub is the previous Lesson's Reference code, imported, not copied. The app never shows it, because `loadScripts` keeps the student's own code. It is there so the "not passed by the stub" test also checks the code the student starts from.
- Level design per Lesson: **2** flag far right with a 3-second Lose event (Lesson 1's 3 px/frame takes 4.5 s); **3** a flag on each side, both needed in one Run; **4** player starts at y = 400, flag on the ground out of reach while falling (no ground clamp → falls off); **5** a red Enemy on the ground that loses on touch, so you must jump.
- `Check.test` now also gets `time`, the seconds since the Run started (the checker counts frames × `Time.deltaTime`). This is needed for Lesson 2's time limit. It is additive: tests that ignore it are unchanged.
- The shared off-screen Lose event moved to `offScreen` in `src/lesson.ts`. Lesson 1 uses it too.
- `course.test.ts` holds a scripted key plan for each Lesson (held keys per frame, with proper press/release), and a new test checks that the previous Lessons' Reference code does not pass.
- Not checked in a browser: the Lesson 3 left-flag distance and the Lesson 5 jump timing were only checked with the headless runs.
