---
label: wayfinder:map
title: learn-dev — game-dev coding tutor MVP
---

## Destination

A build-ready spec for the MVP: a browser app with a game viewport (left) and code editor (right), where a total beginner completes one Lesson at a time, each adding one Mechanic to their character, with harder Lessons as they go.

## Notes

- Domain: education + browser game. Vocabulary in [GLOSSARY.md](../GLOSSARY.md).
- Skills: grilling + domain-modeling for grilling tickets; prototype for prototype tickets; research for research tickets.
- Planning only: produce decisions, not app code.
- Settled while charting:
  - App stack: TypeScript + Vite + Monaco editor + HTML Canvas 2D, static site, browser only.
  - First Course teaches **TypeScript** (runs natively, Monaco type-checks for free, close to C#).
  - Student: total beginner.
  - Student code copies Unity's API and names: see [What game API does the student code against?](tickets/002-game-api.md).
  - A Lesson passes via automatic Checks on game state.
  - MVP: one Course, one character, no accounts, progress in localStorage.
- Tracker: local markdown. Tickets live in `tickets/`, front matter holds `type`, `status`, `blocked_by`, `assignee`. Frontier = `status: open`, all `blocked_by` closed, no `assignee`.

## Decisions so far

<!-- one line per closed ticket -->
- [How do we run student TypeScript safely in the browser?](tickets/001-run-student-ts.md): Monaco diagnostics for type errors + Sucrase transpile (line-preserving) + fresh Web Worker per Run owning the game loop on OffscreenCanvas, heartbeat watchdog terminates infinite loops.
- [What game API does the student code against?](tickets/002-game-api.md): exact Unity names (MonoBehaviour classes, one file per script, read-only `Vector2` position, `Time.deltaTime` fixed 1/60, `Input.GetKeyDown(KeyCode.Space)`). No engine physics: the student writes it. Code carries over between Lessons, and each file gets a Load reference code button once its Lesson is passed.
- [How does a Check work?](tickets/003-check.md): Checks watch live play each frame for the Lesson's Goals (all met in one Run), test only the current Lesson, show a ⬜/✓ checklist plus Lose events, no anti-cheat; on pass, a Compare diff against Reference code.

## Not yet specified

- Hints and help when a student is stuck (inline hints? reveal solution? AI help?).
- Progress and unlock rules (linear only? can you skip?).
- Art style beyond simple shapes.
- Sandbox mode: using the engine on its own, without Lessons (how you enter it, which level or objects it starts with).

## Out of scope

- C# and other language Courses: later effort, once the TypeScript Course works.
- Accounts and server-side saves.
- A Lesson editor for authors.
- Multiplayer.
