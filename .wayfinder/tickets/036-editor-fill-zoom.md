---
title: Editor fills its pane and gets +/- zoom
label: design
status: closed
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

## Resolution

- **Editor fills the pane.** `#code` rows are `auto 1fr auto`: the Console is a 24 px bar (`▸ Console · N lines`, a real `<button>` with `aria-expanded` / `aria-controls`). While open, the rows are `auto 2fr 1fr` (switched with `:has()` on the toggle). The Console opens the first time a Run writes to it (the "▶ Running…" line), so a student who closes it during a Run keeps it closed. Opening calls `editor.layout()` right away, then `revealPositionInCenterIfOutsideViewport`, so the cursor line stays visible.
- **Zoom.** `− 100% +` group at the right of a new `#tabbar` row, outside the `tablist`. Sizes go from 12 to 28 px in 2 px steps, default 14 (`src/zoom.ts`). Clicking `%` resets. Ctrl/Cmd + `=` / `-` / `0` are Monaco commands on the editor and both sides of the Compare diff, so browser zoom still works everywhere else. The size applies to the editor, the diff and the Docs article. It is saved as `editor:fontSize` (bad values fall back to 14) and shared with Sandbox. Buttons disable at the limits, have `aria-label` plus a `title` with the shortcut (`modKey()`, the same ⌘/Ctrl rule as Run), 24 px targets, a `:focus-visible` ring, and `tabular-nums` on the `%`.
- Tests: `src/zoom.test.ts`, `modKey` in `src/run-utils.test.ts`. `npm run typecheck` and `npm test` pass.
- Checked in headless Chromium at 1280×800. With an empty Console the editor reaches the 24 px bar at the bottom of the pane. Run opens the Console with "1 line". +/- and the keys change the size, the size survives reload, and `−` disables at 12 px. Tab reaches `zoom-out` → `zoom-reset` → `zoom-in`. The Console toggle is reachable after Monaco's Ctrl+M (Tab moves focus); a better way out of the editor is ticket 040. No page errors. Screenshots: `.wayfinder/assets/036-console-empty.png`, `.wayfinder/assets/036-console-open.png`.
