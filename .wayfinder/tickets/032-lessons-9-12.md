---
title: Write Lessons 9–12 (camera follow, coins, enemy patrol, stomp)
label: build
status: closed
blocked_by: [027-lessons-6-8, 022-multi-script, 024-camera]
assignee:
---

## What

Same format and rules as ticket 026, for:

| # | Mechanic | New concept |
|---|---|---|
| 9 | Camera follow | reading another object (`Camera.main`) |
| 10 | Coins | `Destroy` + counting; log the count with `Debug.Log` |
| 11 | Enemy patrol | a new Script (`Enemy.ts`) |
| 12 | Stomp vs get hurt | comparing positions |

From Lesson 9 Levels can be wider than the screen. Coins Goal = "collect all coins" in the checklist; no HUD. Guidance keeps shrinking: later Explanations describe the goal and name the API, stubs are empty classes.

## Spec

- [005-first-course.md](005-first-course.md)

## Done when

- Same tests as 026.
- `npm run typecheck` and `npm test` pass.

## Resolution

- Lesson folders `src/lessons/09-camera`, `10-coins`, `11-enemy`, `12-stomp` (lesson.ts, explanation.md with a "Differs from Unity C#" note, hints.md, Reference code), added to `course.ts`.
- `offScreen` in `src/lesson.ts` now tests the camera's view (16:9 around `Camera.main`), plus falling below y = 0. Lessons 1–8 never move the camera, so for them it is the same 960×540 test as before.
- Level design: **9** 2400 px wide, flag at x 2200; leaving the camera's view loses, so the Lesson 8 code loses at the first screen edge. The Reference follows `x` only and keeps `y` at 270. **10** five coins along a wide Level, one only reachable from a platform; Goal "Collect all coins" = no `Coin` left, so walking through without `Destroy` fails. **11** a new `Enemy.ts` (stub = empty class) between two low Walls; two Goals (reach the right wall, then the left wall) need a patrol in one Run. **12** the patrolling enemy again; Goal = no `Enemy` left, touching one loses, so you must stomp (falling and feet above its middle).
- `Overlaps` lives in `Player.ts`, and each Script is its own module, so `Enemy.ts` can't call it. The Enemy Reference compares x positions inline, and the Explanation says why.
- A Lesson's `scripts` holds only the Scripts it adds or changes: Lesson 11 has only `Enemy`, Lesson 12 only `Player`. `course.test.ts` now runs each Lesson with earlier Lessons' Reference code under its own, and the "is complete" test looks for a box's Script in this or any earlier Lesson.
- Key plans for 9, 10 and 12 in `course.test.ts`; Lesson 11 needs no keys.
- Not checked in a browser. The camera centres on the player from the first frame, so you see empty sky left of x = 0 at the start. Clamping it is left out.
