---
label: wayfinder:map
title: learn-dev v2 — after the MVP
---

## Destination

A build-ready spec for v2, what comes after the MVP ([MVP map](map.md)): a Construct-like Sandbox for the same student after the Course, with a Level editor, own sprites, sound and animation, on-screen UI text and Achievements for extra Mechanics, plus a Chapter 2 of Lessons for the new code and game feel, unlocked once Lesson 15 is passed.

## Notes

- Same vocabulary: [GLOSSARY.md](../GLOSSARY.md).
- Skills: grilling + domain-modeling for grilling tickets; prototype for prototype tickets; research for research tickets.
- Same tracker: local markdown, tickets in `tickets/` numbered on from the MVP; front matter holds `label`, `status`, `blocked_by`, `assignee`. Frontier = `status: open`, all `blocked_by` closed, no `assignee`. Open tickets are found that way, not listed here.
- Planning only: produce decisions, not app code.
- UI design: every new screen and prototype follows [Vercel's Web Interface Guidelines](https://vercel.com/design/guidelines) and the frontend-design skill. In particular: only useful scrollbars (no stacks of nested scroll areas), hit targets of at least 24 px (44 px on touch), visible keyboard focus, labels on icon buttons, and reduced motion respected. Rarely used detail goes behind a button, not in a panel that is always open.
- Carried over from the MVP: TypeScript + Vite + Monaco + Canvas 2D static site, browser only, no accounts, Unity-style API, drawn shape = hitbox, art from Kenney's CC0 Pixel Platformer pack.

## Decisions so far

<!-- one line per closed ticket -->
- [Automatic collision checks](tickets/100-automatic-collision-checks.md): opt-in Sandbox box-contact notifications, without physical blocking; existing content stays disabled. Implementation: [101](tickets/101-opt-in-contact-notifications.md).
- [What is in v2?](tickets/048-v2-scope.md): a Construct-like Sandbox for the same student, all of it unlocked after the Course (Lesson 15): Level editor, own sprites, sound and animation, UI text, extra Mechanics as Achievements only. The authors' Lesson editor is left to its own ticket.
- [How does the Level editor work?](tickets/049-level-editor.md): Sandbox only, a 🗺 Level file tab where the stopped game view is the editor; inspector dropdowns, 20 px snap, edit only while stopped, Level code behind a button.
- [How do students bring their own sprites?](tickets/050-own-sprites.md): Sandbox only, one PNG/JPEG per tag per Project (at most 256×256), set in the inspector; Stretch or 20 px Tile with an optional Top image, Reset to the Kenney art, drawn shape = hitbox kept, no new code API.
- [Where do Projects with images live?](tickets/051-project-storage.md): Projects and their image Blobs move to IndexedDB (`idb-keyval`), Course progress and settings stay in localStorage; `persist()` asked once on first save; backup is a one-file JSON Export / Import per Project plus Export everything; a one-time, locked, repeat-safe migration that keeps the old key.
- [Is the Level editor also the authors' Lesson editor?](tickets/052-author-lesson-editor.md): no, it's student-only. Authors keep writing `level.boxes` by hand, helped by a Copy button on "View Level as Code"; Goals, Lose events, Hints, the Explanation and Reference code stay code and Markdown.
- [What do sound and animation add to the engine?](tickets/054-sound-animation.md): Sandbox and Chapter 2 only; the engine animates from the Kenney pack's own frames with no API (tags without frames and own sprites stay still); `this.audio.PlayOneShot("Jump")` with ten fixed clip names from one CC0 pixel pack; the worker sends clip names to the page's Web Audio; a labelled mute button.
- [What on-screen UI text does the student write?](tickets/055-ui-text.md): Sandbox and Chapter 2 only, screen text only; Unity's `OnGUI()` + `GUI.Label(new Rect(...), text)` with top-left, y-down coordinates; `GUI.color`, `GUI.skin.label` fontSize / alignment / outline (on by default), reset every frame; one Kenney CC0 pixel font; not in the Level editor; a hidden label list for screen readers.
- [Which Achievements reward extra Mechanics?](tickets/056-mechanic-achievements.md): Double jump (after First jump), Wall jump (after Bonk) and Dash (after Both ways), earned anywhere from day one and always on the map, so `🏆 n / 21`; tests get `keysDown` in `Run` and rule out stomp bounces, respawns and rides; "secret" reworded to "after the Course".
- [What does the Player look like as a Claude sprite?](tickets/058-claude-player-sprite.md): an original orange critter (not Anthropic's mascot) in a Claude-like palette, 16×16 at 2× filling the 32×32 Player box, with idle / walk / jump frames for Sandbox; Enemy and other tags stay Kenney.
- [How do students keep their saves safe?](tickets/059-backup-ux.md): a 💾 Saves dialog on the menu from Lesson 1 (Export / Import everything, last-backup line), Export in the Project strip, Import as "From a file…" under + New; one quiet menu reminder after 7+ days with new progress; no popups or private-window detection; Import everything merges per Lesson and never overwrites; `<name>.learn-dev.json` / `learn-dev-backup-YYYY-MM-DD.json`.
- [How do students share a Project?](tickets/060-share-project.md): the Export file is the share, imported as an ordinary new Project; before unlock 💾 Saves Import keeps it until Sandbox opens; Sandbox only, no Share button; a dev-build-only toggle unlocks Sandbox for checking.
- [Which CC0 sound pack ships with v2?](tickets/061-sound-pack.md): SubspaceAudio's CC0 "512 Sound Effects (8-bit style)" covers all ten clip names; ten clips converted once to mono 96 kbps MP3 (about 70 KB) in `public/audio/` with the pack's licence and a source README.
- [How do students learn the v2 parts?](tickets/062-teaching-v2.md): an optional Chapter 2 of real Lessons (16 onwards) for sound, screen text and game feel, unlocked with Sandbox at Lesson 15 (Lessons 1–15 unchanged); a Docs Sandbox page and an "Example: Sandbox tour" Project teach the Level editor, sprites and sharing; no new Achievements; Mechanic Achievements get an "Extra" line.
- [Which Lessons make up Chapter 2?](tickets/063-chapter-2-lessons.md): six Lessons on the student's own code (`Ch. 2 n / 6`): 16 Sounds, 17 Coin counter (`HUD.ts`), 18 Short and long jumps, 19 Coyote time (closes the walk-off jump gap), 20 Jump buffering, 21 Screen shake + Hurt; the Level forces the move where it can, otherwise Achievement-style frame and key tests; the checker's `world` gains `sounds` and `labels`; no `Land` clip or `Random` API; the engine plays no sound by itself.

## Not yet specified


## Out of scope

- C# Course: a later effort, v3 or beyond ([How does student C# run in the browser?](tickets/053-csharp-runtime.md), closed).
- Built-in paid AI tutor: Ask DeepSeek stays; the plan waits in [Which LLM and proxy power the AI tutor?](tickets/009-ai-tutor-provider.md).
- Accounts and server saves: backup is an export / import file instead ([Where do Projects with images live?](tickets/051-project-storage.md)).
- Multiplayer.
- Share links and a gallery: a Project travels as its Export file only; a link can't hold a Project with images and a gallery needs a server ([How do students share a Project?](tickets/060-share-project.md)).
- Sharing Lesson code: sharing is Sandbox only ([How do students share a Project?](tickets/060-share-project.md)).
- Text placed in the world (signs, labels over an Enemy): v2 UI text is screen only ([What on-screen UI text does the student write?](tickets/055-ui-text.md)).
- Students' own sounds and background music: a later chapter of Lessons, "How to add your own sounds" ([What do sound and animation add to the engine?](tickets/054-sound-animation.md)).
- In-app sprite editor: students import images only; 📖 Docs point to Piskel or Aseprite ([How do students bring their own sprites?](tickets/050-own-sprites.md)).
- Lessons for extra Mechanics (double jump, wall jump, dash): they are Achievements instead ([What is in v2?](tickets/048-v2-scope.md)).
- Ground pound, wall slide, glide and coyote time Achievements: only Double jump, Wall jump and Dash ([Which Achievements reward extra Mechanics?](tickets/056-mechanic-achievements.md)).
- Authors' Lesson editor: no author mode and no saving back to `lesson.ts`; developers write Lessons in code ([Is the Level editor also the authors' Lesson editor?](tickets/052-author-lesson-editor.md)).
- A Player that looks like Anthropic's Claude mascot: only after Anthropic's brand terms are checked and allow it ([What does the Player look like as a Claude sprite?](tickets/058-claude-player-sprite.md)).
- "Remix this Level", copying a Lesson's Level into a new Sandbox Project: new Projects start as Sandbox mode already decided ([Is the Level editor also the authors' Lesson editor?](tickets/052-author-lesson-editor.md)).
