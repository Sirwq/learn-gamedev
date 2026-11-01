---
title: Add Retry Level after passing a Lesson
label: build
status: closed
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

## Resolution

Added a keyboard-accessible Retry Level button to every Lesson pass screen, including replays and the final Lesson. It calls the existing Run path, which restarts the worker and game canvas with the current code, clears the pass overlay and Goals, and focuses the game. A pending Lesson 15 Sandbox unlock menu is cancelled when a new Run starts. Saved progress, code, hints, Achievements, and passing snapshots remain intact.

Verified with `npm run typecheck`, `npm test`, and Chromium checks for a first pass, keyboard Retry, a second pass, a loss after Retry, saved progress after reload, replay, Compare Code, and the final Lesson's Retry control without Next Lesson.
