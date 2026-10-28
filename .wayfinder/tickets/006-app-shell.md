---
title: What should the app shell look and feel like?
label: wayfinder:prototype
status: closed
blocked_by: []
assignee: vivy
---

## Question

Layout and behavior of the screen: viewport left, editor right, where Lesson instructions sit, Run / Reset / Submit buttons, how errors and Check results show. Make a rough clickable prototype to react to.

Constraint from [How does a Check work?](003-check.md): there is no Submit or Check button. The screen needs Run, a Goal checklist (⬜ / ✓), a Lose-event message, a Next Lesson button on pass, and a Compare view (side-by-side diff with Load reference code) for each passed file.

Constraint from [What is the first Course?](005-first-course.md): the screen needs a **Console** panel under the editor for `Debug.Log` / `LogWarning` / `LogError` output and runtime errors (red, with Script and line). Identical lines collapse with a count, the last 500 are kept, and each Run clears it.

## Resolution

Prototype: [app-shell.prototype.html](../../prototypes/app-shell.prototype.html) on the throwaway branch `prototype/app-shell` (never merged). Of its three layouts, **A (IDE)** wins, with the goals overlay from **C**.

- **Top bar**: app name, Course progress (one pip per Lesson, 5 / 15), **Run** (and **Stop** while running).
- **Lesson strip** under the top bar, full width: the Explanation, scrollable.
- **Main area**: game viewport on the left. On the right, the code editor (one tab per Script) above the Console.
- **Goals** float as a ⬜ / ✓ checklist in the top-left corner of the game viewport, not in a separate panel.
- **Lose event**: a message over the viewport with a Run button.
- **Pass**: "✓ Lesson passed" over the viewport with **Compare <Script>** buttons and **Next Lesson**.
- **Compare** takes the whole window, so both sides (your code and the Reference code) show complete lines with no sideways scrolling. **Load reference code** sits inside it.
- **Runtime errors**: red Console line with Script and line, plus a red marker on that line in the editor.
