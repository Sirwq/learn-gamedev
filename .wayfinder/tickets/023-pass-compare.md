---
title: Pass screen with Next Lesson, Compare and Load reference code
label: build
status: open
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
