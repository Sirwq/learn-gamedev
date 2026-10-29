---
title: Lay out the IDE app shell
label: build
status: closed
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

## Resolution

- `index.html`: layout A (IDE). Top bar holds the app name, progress pips with "n / total", **▶ Run** and **■ Stop**. Below it, the Lesson strip runs full width and scrolls, capped at 140px. The main area is a two-column grid. On the left, the game is a size container: the 960×540 canvas scales to `min(100cqw, 100cqh·16/9)` and keeps its 16:9 shape. The Goals checklist and the Lose/pass overlay sit on top of it, as in prototype C. On the right are the editor tabs, the editor (2fr) and the Console (1fr).
- To prevent sideways scrolling: `box-sizing: border-box`, `overflow: hidden` on body, `min-width: 0` on both grid columns, and `overflow-wrap: anywhere` on the Explanation and Console text.
- `progress(lessons, store)` in `src/check.ts` returns one passed flag per Lesson from localStorage, with a test. Pips are drawn at startup and again on pass.
- Stop shows only while the game loop runs. It hides on Stop, Lose, pass, runtime error and watchdog kill, all handled by one `ended()` helper.
- The tab bar has a single `Player.ts` tab until ticket 022 adds many Scripts.
- Not checked in a real browser (none in the sandbox).
