---
title: Bring every Lesson explanation up to Lesson 1 readability
label: build
status: closed
blocked_by: []
assignee:
---

## What

Make Lessons 2–21 as easy to read as Lesson 1: short steps, clear paragraph breaks, readable examples, and a visible action the student can try.

## Design constraints

- Use Lesson 1 as the reference for pacing and formatting. Apply the same reading layout to every Lesson, not only the title or outer padding. Keep content full width within the Lesson panel while the game viewport stays fixed as lesson text scrolls.
- Preserve each Lesson's teaching goal, code identifiers, working code examples, links, hints, checks, and Reference code. This is a readability pass; the later text review in ticket 099 owns changes to factual explanations and lesson sequence.
- Check long code blocks, hints, and the Chapter 2 Lessons at normal and narrow widths.

## Done when

- Every Lesson explanation can be scanned in steps like Lesson 1, with no squeezed text column or horizontal overflow.
- Hints scroll inside the Lesson panel without moving or resizing the game viewport.
- Browser-check representative early, middle, and Chapter 2 Lessons and inspect the remaining Lesson Markdown for the same pattern. `npm run typecheck` and `npm test` pass.

## Resolution

Reworked Lessons 2–21 into shorter steps with a visible action to try, in both English Markdown and the Russian lesson catalog. The teaching sequence, code identifiers, fenced examples, links, hints, checks, and Reference code remain intact. At widths up to 640 px, the Lesson and editor use the full screen width in a vertical main scroller; the Lesson text still scrolls independently while the game viewport stays fixed.

Verified representative early, middle, and Chapter 2 Lessons in Chromium at 1280, 700, 641, 640, and 390 px, including English and Russian, long examples, hint scrolling, fixed game position, no horizontal overflow, and editor focus at phone width. Inspected all remaining Lesson Markdown and compared code spans, fenced examples, and links against the previous version. `npm run typecheck` and `npm test` pass. The Impeccable detector's whole-file warnings did not identify changes in this pass.
