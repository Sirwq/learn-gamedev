---
title: Route keys to the game only while it has focus
label: build
status: open
blocked_by: [016-engine-core]
assignee:
---

## What

- Run (and Run after a Lose event) moves focus to the game.
- Focused: bright outline. Not focused: dimmed outline and a "Click to play" overlay; clicking takes focus.
- Leaving focus pauses the game (no frames, so no Goals or Lose events) and releases all held keys. Clicking resumes.
- Ctrl/Cmd+Enter runs from the editor and focuses the game. Esc in the game pauses and returns focus to the editor.
- No hot-reload: edits during a paused Run apply on the next Run.
- While the game has focus, arrows and Space don't scroll the page.

## Spec

- [008-keyboard-focus.md](008-keyboard-focus.md)

## Done when

- The pause / release-all-keys logic has a test (e.g. the worker gets a pause message and clears held keys).
- `npm run typecheck` and `npm test` pass.
