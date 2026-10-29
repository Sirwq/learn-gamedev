---
title: Check Goals and Lose events every frame and pass the Lesson
label: build
status: closed
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

## Resolution

- `src/check.ts`: `checker(lesson)` is made once per Run and called every frame on the `worldView`. A Goal stays ✓ for the rest of the Run. A Lose event resets every ✓ to ⬜ and returns its message. `markPassed` / `isPassed` save the pass in localStorage, keyed by Lesson title.
- The worker gets the Lesson index (Goal tests are functions and can't be posted), loads the Lesson from `course.ts` itself, runs the checker after each `step()` inside the same try as student code, and posts `check` only when the result changes. It stops the loop on a Lose event or on pass.
- The page draws the ⬜ / ✓ list top-left over the viewport, the Lose message with a Run button, and "✓ Lesson passed". On pass it calls `markPassed`. The watchdog is stopped so a stopped game isn't reported as an endless loop.
- Lesson 1 Lose event: Player leaves the 960×540 screen on any side.
- `course.test.ts` now uses the checker, so a Lesson whose Reference code hits a Lose event before passing fails the test.
- Next Lesson and Compare buttons are left for ticket 023.
