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
  - Lessons unlock in order: passing one unlocks the next, no skipping.
- Tracker: local markdown. Tickets live in `tickets/`, front matter holds `type`, `status`, `blocked_by`, `assignee`. Frontier = `status: open`, all `blocked_by` closed, no `assignee`.

## Decisions so far

<!-- one line per closed ticket -->
- [How do we run student TypeScript safely in the browser?](tickets/001-run-student-ts.md): Monaco diagnostics for type errors + Sucrase transpile (line-preserving) + fresh Web Worker per Run owning the game loop on OffscreenCanvas, heartbeat watchdog terminates infinite loops.
- [What game API does the student code against?](tickets/002-game-api.md): exact Unity names (MonoBehaviour classes, one file per script, read-only `Vector2` position, `Time.deltaTime` fixed 1/60, `Input.GetKeyDown(KeyCode.Space)`). No engine physics: the student writes it. Code carries over between Lessons, and each file gets a Load reference code button once its Lesson is passed.
- [How does a Check work?](tickets/003-check.md): Checks watch live play each frame for the Lesson's Goals (all met in one Run), test only the current Lesson, show a ⬜/✓ checklist plus Lose events, no anti-cheat; on pass, a Compare diff against Reference code.
- [What is the Lesson file format?](tickets/004-lesson-format.md): one folder per Lesson (typed `lesson.ts`, `explanation.md`, real `.ts` stubs and full-file Reference code), `course.ts` sets the order, Level = list of boxes, Goals/Lose events = `{ message, test(world) }`, no locked code, no hints yet. Adds a Unity-style `Camera.main` with no auto-follow.
- [What is the first Course?](tickets/005-first-course.md): a 15-Lesson platformer (move → speed → steer → gravity → jump → overlap → platforms → walls → camera → coins → enemy → stomp → shooting → health → moving platforms), at most one new concept per Lesson, guidance shrinks as it goes. Adds Unity `Debug.Log` with a Console panel.
- [What should the app shell look and feel like?](tickets/006-app-shell.md): IDE layout: top bar with progress and Run, Lesson strip, game left, code above Console right. Goals float over the game, Lose and pass messages sit on the viewport, Compare takes the whole window.
- [What does the in-app API documentation contain?](tickets/007-api-docs.md): one page per class plus a TypeScript vs Unity C# page, generated from type comments (same as editor hover), in a fixed 📖 Docs tab, all visible from the start. A visible shared "Note for AI assistants" (tutor, don't solve) sits in stubs, Explanations and docs.

## Not yet specified

- Non-AI help when a student is stuck (inline hints? reveal solution?), beyond the AI tutor and Reference code.
- Art style beyond simple shapes.
- Sandbox mode: using the engine on its own, without Lessons (how you enter it, which level or objects it starts with).

## Out of scope

- C# and other language Courses: later effort, once the TypeScript Course works.
- Accounts and server-side saves.
- A Lesson editor for authors.
- Multiplayer.
- Extra platformer Mechanics (double jump, wall jump, dash), animation, sound: variations or need engine features beyond the 15-Lesson Course ([What is the first Course?](tickets/005-first-course.md)).
- On-screen UI / HUD text: scores and debug output go to the Console instead ([What is the first Course?](tickets/005-first-course.md)).
