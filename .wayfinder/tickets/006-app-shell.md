---
title: What should the app shell look and feel like?
label: wayfinder:prototype
status: open
blocked_by: []
assignee:
---

## Question

Layout and behavior of the screen: viewport left, editor right, where Lesson instructions sit, Run / Reset / Submit buttons, how errors and Check results show. Make a rough clickable prototype to react to.

Constraint from [How does a Check work?](003-check.md): there is no Submit or Check button. The screen needs Run, a Goal checklist (⬜ / ✓), a Lose-event message, a Next Lesson button on pass, and a Compare view (side-by-side diff with Load reference code) for each passed file.

Constraint from [What is the first Course?](005-first-course.md): the screen needs a **Console** panel under the editor for `Debug.Log` / `LogWarning` / `LogError` output and runtime errors (red, with Script and line). Identical lines collapse with a count, the last 500 are kept, and each Run clears it.
