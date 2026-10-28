---
title: How does Sandbox mode work?
label: wayfinder:grilling
status: closed
blocked_by: []
assignee: vivy
---

## Question

Sandbox mode is the engine on its own, with no Lessons or Goals. How does the student enter it (a card or tab on the [Course menu](012-course-menu.md)?), when it unlocks (from the start, or after some Lesson?), what Level, objects and Scripts it starts with, whether its code is separate from the Course code, whether Achievements count there ([What does the achievement map look like?](011-achievement-map.md)), and whether Ask DeepSeek works there and what its Tutor prompt holds without a Lesson ([How does the Ask DeepSeek button help without giving answers?](010-ai-tutor-rules.md)).

## Resolution

**A blank, code-only engine, unlocked as a secret after the Course.**

- **What it is**: the engine with no Lessons, Goals, Lose events, Hints, Reference code, Compare or pass screen. The student builds the world in code with `Instantiate`. No Level editor and no own sprites in the MVP (see Out of scope on the map).
- **Secret unlock**: no hint of it before Lesson 15 is passed (no locked card, no greyed tab). Passing Lesson 15 shows "🔓 Sandbox unlocked", then the whole menu slides sideways into the Sandbox menu (like iiSU). From then on a **Sandbox** tab sits next to TypeScript on the [Course menu](012-course-menu.md), switched with Q / E, with the same slide.
- **Projects**: the Sandbox menu is a cover carousel, same style as the Course menu, of the student's Projects plus a "+ New" card. Many Projects, saved in localStorage.
- **New Project** offers two starts:
  - **Blank**: an empty world with one hidden box, tag `Game`, running a `Game.ts` stub (`Start()` / `Update()`). Everything else is spawned from there.
  - **My platformer**: a copy of the student's Course code (all Scripts as of Lesson 15) in one fixed, hand-made playground Level that uses every tag and is wider than the screen.
- **Code is separate**: "My platformer" copies the Course code once. Sandbox edits never touch Lesson code, and the other way round.
- **+ Script** button in the editor's file tabs for new files. A Script attaches the same way as in the Course (a box's `script` field, or `Instantiate`). No new API.
- **Screen**: the same IDE layout as a Lesson ([What should the app shell look and feel like?](006-app-shell.md)). It keeps Run, Console, 📖 Docs, Ask DeepSeek and 🏆. The Lesson strip shows the Project name, with Rename / Duplicate / Delete (Delete asks to confirm). Run plays until Stop.
- **Achievements** count in Sandbox, as everywhere ([What does the achievement map look like?](011-achievement-map.md)).
- **Ask DeepSeek** works: same tutor rules and hint ladder ([How does the Ask DeepSeek button help without giving answers?](010-ai-tutor-rules.md)), but the Lesson part says "Sandbox: free play, no Goals", followed by the open Script, the Console tail and `My question:`.

**Out of scope**: a Construct-like Level editor and students loading their own sprites in Sandbox (Sandbox v2, later effort).
