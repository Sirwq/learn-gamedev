---
title: Add Retry Level after passing a Lesson
label: build
status: open
blocked_by: []
assignee:
---

## What

Add **Retry Level** beside Compare Code and Next Lesson on the pass screen. It starts the same Lesson again with the student's current code and a fresh game state.

## Design constraints

- Keep the Lesson marked passed and preserve saved code, hints, and Achievements. Clear the old pass overlay and reset Goals and runtime objects for the new Run.
- Make Retry available when replaying an already passed Lesson and on the final Lesson, where Next Lesson is absent.
- Match Run's keyboard and accessibility behavior; avoid a page reload if the existing Run path can restart cleanly.

## Done when

- After passing, Retry starts the same Level immediately; the player can pass or lose again without stale Goals or overlay.
- Compare Code and Next Lesson still work, and saved progress survives reload.
- Browser-check a first pass, replayed Lesson, and final Lesson. `npm run typecheck` and `npm test` pass.
