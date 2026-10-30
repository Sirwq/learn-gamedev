---
title: Bring every Lesson explanation up to Lesson 1 readability
label: build
status: open
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
