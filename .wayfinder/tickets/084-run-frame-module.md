---
title: Put one Run's frame logic behind a small interface
label: build
status: closed
blocked_by: []
assignee:
---

## What

Keep Lesson and Sandbox Runs behaving exactly as they do today while making the per-frame game rules one deep module. The worker should ask that module to advance a Run and receive the frame's result; the module owns the order of engine updates, Goal and Lose checks, Achievements, sounds, screen labels, and console lines. Keep worker scheduling, pause and resume messages, drawing, and the page ↔ worker protocol at their current seam.

## Design constraints

- Give the worker a small interface for input and stepping a Run. Return one typed result per frame instead of requiring the worker to drain several engine globals and coordinate checkers itself. Do not add a new seam for dependencies that never vary.
- Preserve the student Script API, the order of `Start`, `Update`, and `OnGUI`, frame timing, key-down behavior, and the rule that Sandbox has no passing Goals.
- Keep object-list snapshot throttling and identity as they are; ticket 085 owns separation of runtime snapshots from the DOM view.
- Keep the existing typed page ↔ worker messages and send only the messages whose values changed, as today. Do not move browser canvas or worker lifecycle code into the Run module.

## Done when

- The worker uses the Run module's interface for one frame's checks and outputs; it no longer composes Goals, Achievements, sound, labels, and console draining itself.
- The same Lesson and Sandbox Scripts produce the same pass/lose results, Achievements, audio clips, GUI labels, console output, and runtime errors.
- Tests cover a representative Run through the new interface, including input, object creation/destruction, a Goal, a Lose event, an Achievement, sound, and GUI text. Keep protocol and lifecycle tests for worker-specific behavior; remove redundant tests of moved internals.
- `npm run typecheck` and `npm test` pass. Verify a Lesson and a Sandbox Run in the browser, including Stop and restart.

## Blocked

The frame module and automated checks are complete, but the required Lesson and Sandbox browser runs, including Stop and restart, could not be verified here. Playwright Chromium fails to start because required system libraries (including `libnspr4.so` and `libnss3.so`) are absent. Installing them requires root access, unavailable in this environment. Ticket stays open pending that browser check.

`run-frame.ts` now owns engine stepping, Goal and Lose checks, Achievements, sound, GUI labels, and console draining. The worker retains scheduling, canvas drawing, message change detection, and lifecycle handling. Tests cover frame input, object creation and destruction, passing and losing, Achievements, sound, labels, logs, Sandbox with no Goals, and runtime errors.
