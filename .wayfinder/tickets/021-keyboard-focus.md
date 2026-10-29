---
title: Route keys to the game only while it has focus
label: build
status: closed
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

## Resolution

- Engine: `releaseAllKeys()` lets go of every held key (they report `GetKeyUp` on the next frame). Tested in `engine.test.ts`.
- Worker: `pause` stops frames (the next frame parks itself instead of running) and releases all keys, then answers `paused`; `resume` restarts the parked frame. No frames while paused, so no Goals or Lose events.
- Page: the canvas posts `pause` on blur and `resume` on focus while a Run is live, and shows a "Click to play" overlay; clicking it focuses the game. Dim outline when unfocused, bright when focused. Run and the Run-after-Lose button focus the game; Ctrl/Cmd+Enter in the editor runs; Esc in the game returns focus to the editor (which pauses). Keys are `preventDefault`ed so arrows/Space don't scroll; Tab passes through so keyboard users can leave.
- The watchdog skips paused time only after the worker confirms the pause, so a Script stuck in a loop is still caught.
