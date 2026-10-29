---
title: Take the AI note out of the student's code
label: design
status: open
blocked_by: []
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look. User-friendliness first, looks second.

## What

- Decision: the "Note for AI assistants" comment no longer sits on line 1 of Script stubs. It is the first thing a beginner reads, it isn't for them, it runs off the editor's right edge and fails contrast (4.2:1).
- Stop using `withNoteComment` in the Lesson stubs (`src/lessons/*/lesson.ts`) and delete it if nothing else uses it.
- Code already saved in localStorage starts with that comment: strip it on load when the first line exactly equals `// ${aiNote}` (plus the blank line after it). Never touch any other student text.
- Explanation, Docs and the Ask DeepSeek Tutor prompt keep the note (`withNoteBox`, `docs.ts`, `tutorRules`).
- Accepted trade-off: code a student copies into an AI by hand no longer carries the note.
- Update spec [007-api-docs.md](007-api-docs.md) (the "Note for AI assistants" line) and its line in `.wayfinder/map.md`.

## Done when

- New and old saved code show no AI note in the editor; Reference code and Compare diff still line up.
- Tests cover the strip-on-load (exact match only) and that the Tutor prompt still starts with the note.
- `npm run typecheck` and `npm test` pass.
