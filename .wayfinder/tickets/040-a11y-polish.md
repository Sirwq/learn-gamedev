---
title: Lesson page accessibility and polish
label: design
status: open
blocked_by: [039-header-buttons]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look. User-friendliness first, looks second.

## What

Found in a Lighthouse run (Accessibility 93) and a guideline review of Lesson 1:

- `☰` button: add `aria-label` (it only has `title`).
- `#progress`: accessible name must contain the visible "0 / 15" (Lighthouse label-content-name-mismatch). Progress pips are 6 px tall: make them easier to read, and don't rely on color alone.
- `#console`: `aria-label` is invalid on a plain `<pre>`; give it a valid role (e.g. `role="log"`) or a visible heading.
- Contrast: `#999` on `#2d2d2d` (inactive tab, docs nav) and similar greys must pass; hover / focus states stronger than rest.
- `<html>`: `color-scheme: dark`; `<meta name="theme-color">` matching the background.
- `<title>` follows the context: "1. Move right · learn-dev", Project name in Sandbox.
- Tab is trapped in Monaco (inserts indentation). Show a small hint for Monaco's Ctrl+M "Tab moves focus" toggle, or make Esc → Tab leave the editor.
- Every icon/emoji-only control has a text equivalent; decorative emoji `aria-hidden`.

## Done when

- Lighthouse Accessibility has no failed audits on a Lesson page.
- A keyboard-only pass can reach every header button, the Lesson text, the game and the editor, and get back out of the editor.
- `npm run typecheck` and `npm test` pass.
