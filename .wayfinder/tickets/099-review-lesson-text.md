---
title: Review all Lesson text for clarity and correctness
label: build
status: closed
blocked_by: [097-lesson-readability]
assignee:
---

## When

Later.

## What

Review Lessons 1–21 as a learning path and improve explanations, hints, and examples where a student would be confused or taught the wrong behavior.

## Design constraints

- Check every claim against the current engine API, Lesson Goals, and Reference code. Preserve working code identifiers and intended challenge difficulty.
- Record the issue and change for each Lesson touched. Keep this separate from the visual and formatting pass in ticket 097.
- If Russian localization from ticket 087 has shipped, update its matching learning text in the same work so meanings stay aligned.

## Done when

- Each Lesson's instructions match what the student can do and what the checker accepts; unclear steps have concrete actions and expected results.
- Changed examples run or typecheck as appropriate, and a representative learner path is browser-checked. `npm run typecheck` and `npm test` pass.

## Resolution

Reviewed the English explanations and hints for Lessons 1–21 against their Goals, Reference code, level layouts, and the engine API. Corrected these learning-text issues in English and Russian:

- Lesson 10: the original action implied walking would collect every coin; explained the elevated coin and the jump needed to reach it.
- Lesson 14: the spike-order explanation obscured the same-frame respawn check; explained when to check and reset the Player.
- Lesson 17: the instructions omitted that the Goal must observe two different on-screen counts; added the initial-count and after-collection actions. Added a content regression check for both languages.
- Lesson 19: “just after” did not make the edge-jump window concrete; gave a frame window and clarified that the jump must start after leaving support.
- Lesson 20: the action did not make the falling press and immediate landing jump explicit; added both and the flag result.

No code examples, identifiers, checks, or Reference code changed. `npm run typecheck` and `npm test` pass. In Chromium, Lesson 1 passed with the shown movement code; Russian Lesson 17 displayed the aligned two-count guidance. The browser view also confirmed the Lesson 1 flag sprite is red, so its original color wording remains correct.
