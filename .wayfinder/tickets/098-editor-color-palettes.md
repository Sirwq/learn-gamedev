---
title: Offer more code editor color palettes
label: build
status: open
blocked_by: []
assignee:
---

## When

Later.

## What

Let students choose among a small set of readable code editor color palettes, independent of the app's light and dark page theme.

## Design constraints

- Include a clear default matching today's editor, save the chosen palette, and keep code and diagnostics readable in each option. Avoid changing the game or Lesson colors.
- Keep the picker keyboard accessible and compatible with the language picker. Do not introduce a large theme dependency for a few palettes.

## Done when

- A student can preview, select, and persist a palette without changing code or Course progress.
- Selection, errors, diff view, and active line stay legible in every palette. Browser-check both page themes; `npm run typecheck` and `npm test` pass.
