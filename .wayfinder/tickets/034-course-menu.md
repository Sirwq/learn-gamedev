---
title: Build the Course menu cover carousel
label: build
status: open
blocked_by: [023-pass-compare, 025-sprites]
assignee:
---

## What

- The app opens on the Course menu, focused on the current Lesson. In a Lesson, ☰ or the progress pips reopen it; Esc returns.
- Cover carousel: one portrait card per Lesson; focused card big with glowing outline, neighbours smaller. ← → move; click a side card focuses it, click the focused card plays it.
- Cover art: the Lesson's Level in pixel style, cropped and zoomed around its subject, "LESSON n" + name over a dark fade. Background = focused cover, blurred and darkened.
- States: passed (✓), current (▶ next), locked (grey 🔒; picking shows "Pass Lesson N first").
- Top bar: Course tabs on Q / E (TypeScript, greyed "C# · soon"); 🏆 count and Lessons passed on the right.
- Under the card: `N. Name`, new concept, Scripts used, state. Bottom bar key hints: `Esc` Back to Lesson, `N / 15`, `A` Achievements, `Enter` Play / Replay / Locked.
- Replay of a passed Lesson asks **Keep my current code** (default) or **Load my code from when I passed it** (↑ ↓ Enter work). Save a code snapshot per passed Lesson. Replay shows "↺ replaying a passed Lesson" in the strip and the pass screen offers **Back to Lesson N**.

The prototype is on a local branch: `git show prototype/course-menu:prototypes/course-menu.prototype.html` (round 2). Its look is rough on purpose; polish it. Don't merge that branch.

## Spec

- [012-course-menu.md](012-course-menu.md)
- [014-art-style.md](014-art-style.md): covers

## Done when

- Tests cover card states from progress, and replay restore / return of newer code.
- `npm run typecheck` and `npm test` pass.
