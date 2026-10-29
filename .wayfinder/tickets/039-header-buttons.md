---
title: Run is the green main button, Ask DeepSeek is blue with its logo
label: design
status: open
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
