---
title: Write Lessons 2–5 (speed, steer, gravity, jump)
label: build
status: open
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
