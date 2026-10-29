---
title: Load Lessons from folders and ship Lesson 1
label: build
status: closed
blocked_by: [016-engine-core]
assignee:
---

## What

Add the Lesson file format and load Lesson 1 instead of the hard-coded Level from ticket 016.

- `src/lessons/01-move/lesson.ts` exports a typed `Lesson` (title, Level, Goals, Lose events, Scripts it adds), plus `explanation.md` and real `.ts` files for the `Player.ts` stub and its Reference code.
- `src/lessons/course.ts` lists the Lesson folders in order.
- The page shows the Lesson title and the Explanation (rendered Markdown) in a strip above the game, and opens the stub in the editor.
- Goals and Lose events are only defined here; ticket 018 checks them.

Lesson 1 content: "Move right" (statements, numbers). One-screen Level with a Player and a flag; Goal = reach the flag. The stub is `Player.ts` with an empty `Update()`, and the Explanation gives almost the whole line. Include the shared "Note for AI assistants" text (see 007) in the stub header and the Explanation, from one source file.

## Spec

- [004-lesson-format.md](004-lesson-format.md)
- [005-first-course.md](005-first-course.md): Lesson 1 row and the guidance rules
- [007-api-docs.md](007-api-docs.md): Note for AI assistants

## Done when

- The app opens straight into Lesson 1 from its folder.
- A test checks every Lesson in `course.ts` has a title, a Level with exactly one `script: "Player"` box, at least one Goal, and a stub + Reference file for each Script it adds.
- A test runs Lesson 1's Reference code in the engine (headless, no canvas) and confirms the Goal becomes true within 10 simulated seconds.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `src/lesson.ts` holds the `Lesson` / `Check` types plus `overlaps` and `find` helpers for Goal tests.
- `src/lessons/01-move/` has `lesson.ts`, `explanation.md`, `stub/Player.ts` and `reference/Player.ts`. `src/lessons/course.ts` lists the Lessons in order.
- The Note for AI assistants lives only in `src/lessons/ai-note.ts`. It is added to the stub as a header comment and to the Explanation as a blockquote.
- `src/engine.ts` gets `startGame` (spawn, attach Scripts, Start, step) and `worldView`, both used by the worker and the headless test.
- The page shows the title and the Explanation (rendered with `marked`) in a strip above the game, and opens the Player stub.
- `src/lessons/course.test.ts` checks every Lesson's shape. It runs the Reference code headless, which must meet every Goal within 600 frames, and checks that the stub alone does not.
