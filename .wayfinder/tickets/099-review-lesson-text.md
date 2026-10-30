---
title: Review all Lesson text for clarity and correctness
label: build
status: open
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
