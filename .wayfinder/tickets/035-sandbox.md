---
title: Build Sandbox mode
label: build
status: open
blocked_by: [034-course-menu, 033-lessons-13-15, 031-achievements, 030-ask-deepseek]
assignee:
---

## What

- Secret: no sign of it before Lesson 15 is passed. Passing Lesson 15 shows "🔓 Sandbox unlocked", then the menu slides sideways into the Sandbox menu. From then on a **Sandbox** tab sits next to TypeScript (Q / E, same slide).
- Sandbox menu: cover carousel of Projects plus a "+ New" card. Many Projects in localStorage.
- New Project: **Blank** (one hidden box tagged `Game` running a `Game.ts` stub) or **My platformer** (a one-time copy of the student's Course code in a fixed playground Level that uses every tag and is wider than the screen).
- Sandbox code is separate from Course code both ways.
- **+ Script** button in the file tabs. No new API.
- Same IDE screen minus Lesson parts (no Goals, Lose events, Hints, Reference, Compare, pass screen). Lesson strip shows the Project name with Rename / Duplicate / Delete (Delete confirms). Run plays until Stop.
- Achievements count here. Ask DeepSeek's Lesson part says "Sandbox: free play, no Goals".

## Spec

- [015-sandbox-mode.md](015-sandbox-mode.md)

## Done when

- Tests cover: unlock only after Lesson 15, Project create / duplicate / delete in storage, My platformer copy not linked to Course code.
- `npm run typecheck` and `npm test` pass.
