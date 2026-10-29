---
title: Sandbox tab shows on the Course menu before it is unlocked
label: build
status: open
blocked_by: [041-back-to-levels]
assignee:
---

## What

With 0 / 15 Lessons passed, the top bar still shows the **Sandbox** chip, and it can be clicked and focused. `openMenu()` sets `chipSandbox.hidden = true`, but `#menu .bar button { display: flex }` beats the `[hidden]` attribute, so the chip stays visible.

- Hidden menu buttons stay hidden. For example, add `#menu [hidden] { display: none }`, or a global `[hidden] { display: none !important }` if no other code depends on the old behaviour.
- E (Sandbox) keeps toasting "C# comes later" while the Sandbox is locked. The wording is a separate ticket.

## Done when

- A fresh profile shows no Sandbox chip, and Tab skips it. After the Course is passed it shows and works.
- A test covers it (e.g. the CSS rule in `a11y.test.ts`, the same way it checks other static markup).
- `npm run typecheck` and `npm test` pass.
