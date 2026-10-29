---
title: Run is the green main button, Ask DeepSeek is blue with its logo
label: design
status: closed
blocked_by: []
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look. User-friendliness first, looks second.

## What

- **Run**: the green primary button in the header (today all header buttons are the same grey). Shows its shortcut: ⌘↵ on Mac, Ctrl+↵ elsewhere (platform symbols, `<kbd>`, non-breaking). **Stop** takes its place while running, same size so nothing jumps.
- **Run feedback**: each Run prints one Console line, e.g. `▶ Running Lesson 1…` (Sandbox: the Project name). Nothing else new.
- **Ask DeepSeek**: blue (DeepSeek's brand blue, about `#4D6BFE`) with the DeepSeek whale logo before the label.
  - Logo as an inline SVG from DeepSeek's official brand asset, `aria-hidden="true"`; the visible label stays the accessible name. Don't redraw or recolor the logo beyond white-on-blue.
  - Keep it clearly second to Run (Run is the one main action).
- Hover / active / focus states have more contrast than rest; visible `:focus-visible` ring; hit targets ≥ 24 px; `touch-action: manipulation`; list transition properties (no `transition: all`).

## Done when

- Run is the first thing the eye lands on in the header; the shortcut shows the right symbol per platform.
- Each Run prints exactly one start line in the Console.
- Ask DeepSeek is blue with the logo, readable (text contrast passes), screen readers read "Ask DeepSeek" once.
- `npm run typecheck` and `npm test` pass; header screenshot in Resolution.

## Resolution

- **Run** is green (`#1f883d`, white text 4.5:1) and bold, with a `<kbd>` shortcut from `runShortcut(navigator.platform)`: `⌘↵` on Mac/iPhone/iPad, `Ctrl+↵` elsewhere (`white-space: nowrap`). The title tooltip says the same.
- **Stop** takes Run's place while running. Both sit in one grid cell (`#run-slot`) and the hidden one keeps its space with `visibility: hidden`, so the header doesn't move (measured: 136 px both ways). If Stop had focus when the game ends, focus goes back to Run.
- **Run feedback**: `run()` starts the cleared Console with `runStartLine()`: `▶ Running Lesson N…`, or the Project name in Sandbox.
- **Ask DeepSeek**: blue `#4463f5` instead of `#4D6BFE`. The exact brand blue only gives 4.33:1 with white text, which fails; this shade gives 4.83:1. It has the DeepSeek whale as an inline SVG. The path is copied verbatim from the `@lobehub/icons-static-svg` DeepSeek brand icon, uses `currentColor` (white), and has `aria-hidden="true"`, so the accessible name is just "Ask DeepSeek". It uses regular weight while Run is bold, so Run stays the main action.
- Header buttons: min height 28 px, `touch-action: manipulation`, transitions only on `background-color` and `border-color`, a `:focus-visible` ring, and hover/active states darker than rest (more contrast).
- Tests: `runShortcut` and `runStartLine` in `src/run-utils.test.ts`. `npm run typecheck` and `npm test` pass.
- Checked in headless Chromium: one start line in the Console, Run can't be clicked while running, no page errors. Screenshots: `.wayfinder/assets/039-header-rest.png`, `.wayfinder/assets/039-header-running.png` (the 🏆 glyph is missing only because the headless box has no emoji font).
