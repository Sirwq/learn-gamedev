---
title: Editor fills its pane and gets +/- zoom
label: design
status: open
blocked_by: []
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look (`index.html` styles, Monaco `vs-dark`).

## What

- **Editor fills the pane.** Today `#code` is `grid-template-rows: auto 2fr 1fr`, so the Console always takes a third of the height, even when empty (big blank block under the code). The editor must take all space from the file tabs down to the bottom of the pane.
  - Console becomes a thin bar at the bottom (title "Console" + line count) that stays collapsed while empty and opens to a fixed share of the pane when it gets output or is clicked. Collapse / expand is a real `<button>` with `aria-expanded`.
  - The editor re-lays out on every size change (already `automaticLayout: true`; check nothing clips).
- **Zoom +/-.** Small `−` `100%` `+` group at the right end of the file tabs row (`#tabs`).
  - Changes Monaco `fontSize` via `editor.updateOptions` in steps (e.g. 12 → 28 px, default 14). Clicking the `%` resets.
  - Keys: Ctrl/Cmd + `=` / `-` / `0` while the editor has focus (do not steal browser zoom elsewhere).
  - Also applies to the 📖 Docs tab text and the Compare diff editor.
  - Saved in localStorage (`editor:fontSize`), restored on load; Sandbox shares it.
  - Buttons disable at min / max; each has an `aria-label` and a `title` tooltip with its shortcut; hit target ≥ 24 px; `%` uses `font-variant-numeric: tabular-nums` so the group does not jump.

## Done when

- At any window height the editor reaches the bottom of the pane when the Console is empty; output opens the Console without hiding the cursor line.
- +/- and the shortcuts change the font size, the value survives reload, limits disable the buttons.
- Keyboard-only: Tab reaches zoom buttons and the Console toggle, focus ring visible.
- `npm run typecheck` and `npm test` pass; checked in a real browser (screenshot in Resolution).
