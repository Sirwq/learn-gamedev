---
title: Lay out the IDE app shell
label: build
status: open
blocked_by: [018-checks, 019-console]
assignee:
---

## What

Arrange the page into the chosen IDE layout:

- **Top bar**: app name, Course progress (one pip per Lesson, e.g. 1 / 15, filled for passed), **Run**, and **Stop** while running.
- **Lesson strip** under the top bar, full width: the Explanation, scrollable.
- **Main area**: game viewport (960×540, scaled to fit) on the left; on the right, editor tabs (one per Script) above the Console.

The prototype is on a local branch: `git show prototype/app-shell:prototypes/app-shell.prototype.html`. Use layout **A (IDE)** from it, with the Goals overlay from **C**. Don't merge that branch.

## Spec

- [006-app-shell.md](006-app-shell.md)

## Done when

- Run / Stop work, progress pips reflect passed Lessons from localStorage.
- Nothing scrolls sideways at 1280×720.
- `npm run typecheck`, `npm test` and `npm run build` pass.
