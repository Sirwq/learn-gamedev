---
title: Check Goals and Lose events every frame and pass the Lesson
label: build
status: open
blocked_by: [017-lesson-loader]
assignee:
---

## What

Run the current Lesson's Goals and Lose events every frame inside the game worker against a read-only `world` view.

- Goals float as a ⬜ / ✓ checklist in the top-left corner of the game viewport, never ✗.
- The Lesson passes when every Goal is met in the same Run. On pass: mark it passed in localStorage (stays passed even if later code breaks), show "✓ Lesson passed" over the viewport.
- A Lose event stops the game and shows its message over the viewport with a Run button. Run or a Lose event resets every ✓ to ⬜.
- Lesson 1 gets a Lose event "You fell off the screen. Press Run to try again."

## Spec

- [003-check.md](003-check.md)
- [006-app-shell.md](006-app-shell.md): where Goals, Lose and pass messages sit

## Done when

- Tests cover the Check logic headless: Goals met in one Run pass, Goals met across two Runs don't, a Lose event resets ✓ to ⬜, passed state is saved and reloaded.
- `npm run typecheck` and `npm test` pass.
