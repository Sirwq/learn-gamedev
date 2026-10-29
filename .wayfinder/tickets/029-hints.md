---
title: Add Hints and the Still stuck box
label: build
status: closed
blocked_by: [017-lesson-loader]
assignee:
---

## What

- Optional `hints.md` per Lesson folder, split by `## Hint 1` / `## Hint 2` / `## Hint 3` (Markdown, may hold code).
- 💡 Hints at the bottom of the Explanation, below the "Differs from Unity C#" box. One click opens the next hint. No timer, no cost.
- Opened hints saved per Lesson in localStorage.
- After the last hint, a fixed "Still stuck?" box (same in every Lesson): points to Ask DeepSeek, 📖 Docs, and "Ask the person on your left, then the one on your right."
- Write 2–3 hints for Lesson 1 (and for any other Lessons that exist when you pick this up).

## Spec

- [013-stuck-help.md](013-stuck-help.md)

## Done when

- Tests cover splitting `hints.md` and saving / restoring opened hints.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `splitHints` (src/lesson.ts) splits a Lesson's `hints.md` at `## Hint N` headings; `Lesson.hints` is optional.
- `openedHints` / `saveOpenedHints` keep the count of opened hints per Lesson (keyed by title) in localStorage.
- The Explanation panel shows opened hints, a "💡 Hint n of m" button for the next one, and the fixed "Still stuck?" box once all are open (or right away if the Lesson has none).
- Wrote 3 hints (nudge → idea → fill-in-the-blank) for each of Lessons 1–8.
- Not done here: adding opened hints to the Tutor prompt belongs to 030-ask-deepseek; the 📖 Docs / Ask DeepSeek mentions are text only until those exist. No browser check was run.
