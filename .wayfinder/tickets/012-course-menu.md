---
title: What does the Course menu look like?
label: wayfinder:prototype
status: closed
blocked_by: [011]
assignee: vivy
---

## Question

[What does the achievement map look like?](011-achievement-map.md) took Lessons off the achievement map: picking Lessons gets its own screen. What does that Course menu look like and how does the student get there? Cover: how it opens (the progress pips? a button? is it the first screen on launch?), how passed / current / locked Lessons look (Lessons unlock in order, no skipping), what replaying a passed Lesson does to the student's code (code carries over between Lessons, see [What game API does the student code against?](002-game-api.md)), and whether a Lesson pass gets a toast now that it isn't an Achievement. Round 1 of the achievement prototype had a winding-path layout (variant C, commit `6dea4fb` on `prototype/achievement-map`) worth reusing as a starting point.

## Resolution

Prototype: [course-menu.prototype.html](../../prototypes/course-menu.prototype.html) on the throwaway branch `prototype/course-menu` (never merged). Round 1 (a winding path, a drawer list, a card grid) was rejected. Round 2 follows the student's references, emulator-frontend home screens, and is the answer. The prototype's look is rough on purpose; the real screen gets its visual polish when it is built.

- **First screen**: the app opens on the Course menu, focused on the current Lesson. In a Lesson, ☰ or the progress pips reopen it; Esc goes back to the Lesson.
- **Cover carousel**: one portrait card per Lesson in a horizontal row. The focused card is big with a glowing outline; its neighbours are smaller on each side. ← → move; clicking a side card focuses it, clicking the focused card plays it.
- **Cover art**: our own, drawn from the Lesson's Level, with the Lesson number and name. The full-window background is the focused cover, blurred and darkened.
- **States**: passed (✓ tag), current (▶ next tag), locked (grey with 🔒). Picking a locked Lesson shows a "Pass Lesson N first" toast.
- **Top bar**: Course tabs switched with Q / E (like L1 / R1); TypeScript only, a greyed "C# · soon" hints at later Courses. On the right, 🏆 Achievements count and Lessons passed.
- **Under the card**: `N. Name`, then the new concept, the Scripts it uses, and its state.
- **Bottom bar** with key hints: `Esc` Back to Lesson, `N / 15`, `A` Achievements, `Enter` Play / Replay / Locked.
- **Replay** of a passed Lesson asks: **Keep my current code** (default, nothing changes) or **Load my code from when I passed it** (the editor goes back to the code saved at that pass; the newer code is kept and returns on going back to the current Lesson). ↑ ↓ and Enter work in the dialog. A replay shows "↺ replaying a passed Lesson" in the Lesson strip, and its pass screen offers **Back to Lesson N** instead of Next Lesson.
- **Pass toast**: yes. Passing a Lesson pops a green "Lesson passed" toast in the same top-right spot as Achievement toasts.
- New stored data: a code snapshot per passed Lesson, in localStorage with progress.
