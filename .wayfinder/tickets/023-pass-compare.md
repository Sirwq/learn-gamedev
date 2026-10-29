---
title: Pass screen with Next Lesson, Compare and Load reference code
label: build
status: closed
blocked_by: [018-checks, 022-multi-script, 020-app-shell]
assignee:
---

## What

- On pass, the overlay shows **Compare <Script>** buttons (one per Script the Lesson touched) and **Next Lesson**. Next Lesson unlocks only after passing (Lessons unlock in order).
- **Compare** takes the whole window: Monaco's read-only diff editor, the student's code vs the Reference code, full lines with no sideways scroll. **Load reference code** inside it replaces only that file.
- Each file's Load reference code loads the snapshot from the latest Lesson the student has passed.
- A green "Lesson passed" toast in the top-right corner.

## Spec

- [003-check.md](003-check.md): On pass
- [006-app-shell.md](006-app-shell.md)
- [002-game-api.md](002-game-api.md): Load reference code button
- [012-course-menu.md](012-course-menu.md): Pass toast

## Done when

- Tests cover which Reference snapshot loads for a file, and that Next Lesson stays locked until pass.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `src/check.ts`: `unlocked(lessons, i)` (Lesson 1, then each Lesson once the one before is passed) and `referenceFor(lessons, script)` (the Reference snapshot from the latest passed Lesson that has that Script, undefined before). Both tested in `check.test.ts`.
- Pass overlay (`index.html`, `src/main.ts`): "✓ Lesson passed" with one **Compare <Script>.ts** button per Script the Lesson adds and **Next Lesson ▶** (hidden on the last Lesson). Next Lesson opens `?lesson=N`; the page only honours it when `unlocked`, else opens Lesson 1. This is a stopgap until the Course menu ticket picks Lessons.
- Compare: a full-window section with Monaco's read-only diff editor, side by side, `wordWrap: "on"` so there is no sideways scroll. Left is the student's live model and right is the Reference code. Esc or ✕ closes it. **Load reference code** replaces only that file, as one edit, so Ctrl+Z restores the student's code. The Reference model uses the `javascript` language with JS diagnostics off, so the shared TS project never sees a second global `class Player` (which would be a "Duplicate identifier" error and block Run).
- Green "Lesson passed" toast in the top-right corner. It slides in, fades out after about 4 s and stacks in `#toasts`, ready for Achievement toasts.
- Not checked in a real browser (none in the sandbox).
