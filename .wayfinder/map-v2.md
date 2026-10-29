---
label: wayfinder:map
title: learn-dev v2 — after the MVP
---

## Destination

A build-ready spec for v2, what comes after the MVP ([MVP map](map.md)): a Construct-like Sandbox for the same student after the Course, with a Level editor, own sprites, sound and animation, on-screen UI text and Achievements for extra Mechanics, all behind the secret Sandbox unlock.

## Notes

- Same vocabulary: [GLOSSARY.md](../GLOSSARY.md).
- Skills: grilling + domain-modeling for grilling tickets; prototype for prototype tickets; research for research tickets.
- Same tracker: local markdown, tickets in `tickets/` numbered on from the MVP; front matter holds `label`, `status`, `blocked_by`, `assignee`. Frontier = `status: open`, all `blocked_by` closed, no `assignee`. Open tickets are found that way, not listed here.
- Planning only: produce decisions, not app code.
- UI design: every new screen and prototype follows [Vercel's Web Interface Guidelines](https://vercel.com/design/guidelines) and the frontend-design skill. In particular: only useful scrollbars (no stacks of nested scroll areas), hit targets of at least 24 px (44 px on touch), visible keyboard focus, labels on icon buttons, and reduced motion respected. Rarely used detail goes behind a button, not in a panel that is always open.
- Carried over from the MVP: TypeScript + Vite + Monaco + Canvas 2D static site, browser only, no accounts, Unity-style API, drawn shape = hitbox, art from Kenney's CC0 Pixel Platformer pack.

## Decisions so far

<!-- one line per closed ticket -->
- [What is in v2?](tickets/048-v2-scope.md): a Construct-like Sandbox for the same student, all of it behind the secret Lesson-15 unlock: Level editor, own sprites, sound and animation, UI text, extra Mechanics as Achievements only. The authors' Lesson editor is left to its own ticket.
- [How does the Level editor work?](tickets/049-level-editor.md): Sandbox only, a 🗺 Level file tab where the stopped game view is the editor; inspector dropdowns, 20 px snap, edit only while stopped, Level code behind a button.
- [How do students bring their own sprites?](tickets/050-own-sprites.md): Sandbox only, one PNG/JPEG per tag per Project (at most 256×256), set in the inspector; Stretch or 20 px Tile with an optional Top image, Reset to the Kenney art, drawn shape = hitbox kept, no new code API.

## Not yet specified

- Teaching the new parts: whether the Course gains Lessons (or Achievements) for whatever v2 adds, or students find it on their own in Sandbox mode, like the secret unlock.
- Sharing a Project with someone else (a file? a link?): hangs on where Projects live.

## Out of scope

- C# Course: a later effort, v3 or beyond ([How does student C# run in the browser?](tickets/053-csharp-runtime.md), closed).
- Built-in paid AI tutor: Ask DeepSeek stays; the plan waits in [Which LLM and proxy power the AI tutor?](tickets/009-ai-tutor-provider.md).
- Accounts and server saves: backup is an export / import file instead.
- Multiplayer.
- In-app sprite editor: students import images only; 📖 Docs point to Piskel or Aseprite ([How do students bring their own sprites?](tickets/050-own-sprites.md)).
- Lessons for extra Mechanics (double jump, wall jump, dash): they are Achievements instead ([What is in v2?](tickets/048-v2-scope.md)).
