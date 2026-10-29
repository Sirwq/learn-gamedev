---
title: ☰ becomes a "Back to Lessons" button
label: design
status: open
blocked_by: []
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look. User-friendliness first, looks second.

## Why

In a Lesson, the `☰` button looks like "open a menu" (a dropdown or side drawer). Clicking it does something else: the whole page is swapped for the Course menu (the Lesson carousel). Students don't expect that, so the icon misleads them.

## What

- Swap the `☰` glyph for a labelled button: `← Back to Lessons` (the arrow is `aria-hidden`). Keep it first in the header. It still calls `openMenu()`.
- Its `aria-label` / `title` read "Back to Lessons". Update the "Course menu" text in `index.html` and the `a11y.test.ts` assertion that checks it.
- In a Sandbox Project, the Course menu opens on the Sandbox tab. The label there is `← Back to Projects`, the same way `#menu-back` already switches to "Back to Project".
- The `#progress` pips also open the Course menu. Leave their behaviour as it is, but make their `aria-label` say "…, back to Lessons" so both controls use the same words.
- Narrow screens: the button may shrink to `←` plus a visible tooltip, but the full text stays in its `aria-label`.

Wording: "Lessons", the glossary term the cards already use (user decision).

## Done when

- A Lesson shows `← Back to Lessons` in the header, and clicking it opens the Course menu on the current Lesson.
- A Sandbox Project shows `← Back to Projects`.
- `npm run typecheck` and `npm test` pass.
