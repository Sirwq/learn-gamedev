---
title: Add Hints and the Still stuck box
label: build
status: open
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
