---
title: Write Lessons 9–12 (camera follow, coins, enemy patrol, stomp)
label: build
status: open
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
