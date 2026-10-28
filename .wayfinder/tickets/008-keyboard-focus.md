---
title: How do keys reach the game instead of the editor?
label: wayfinder:grilling
status: closed
blocked_by: [006]
assignee: vivy
---

## Question

The student plays with the keyboard (arrows, Space) while the code editor sits beside the game. When the editor has focus, keys type into the code instead of moving the player, and the prototype from [What should the app shell look and feel like?](006-app-shell.md) showed this is easy to trip over. Does Run move focus to the game? Does clicking the game take focus, and how does the student see which side has it? What happens when the student clicks back into the editor while the game runs: pause, keep running, or stop?

## Resolution

The game runs in a Web Worker, which can't hear the keyboard, so the page forwards key events to it only while the game viewport has focus.

- **Run** (and Run after a Lose event) moves focus to the game.
- **Focus is visible**: bright outline on the viewport when focused; when not, the outline dims and a "Click to play" overlay shows. Clicking the viewport takes focus.
- **Leaving focus pauses** the game (no frames, so no Goals met or Lose events while the student isn't controlling it). Clicking the game resumes.
- **Losing focus releases all keys**, so nothing stays stuck down.
- **Shortcuts**: Ctrl/Cmd+Enter runs from the editor and focuses the game; Esc in the game pauses and sends focus back to the editor.
- **No hot-reload**: edits during a paused Run do nothing until the next Run, which restarts with the new code.
- While the game has focus, arrows and Space don't scroll the page.
