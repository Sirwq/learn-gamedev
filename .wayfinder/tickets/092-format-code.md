---
title: Add a Format Code action to the editor
label: build
status: open
blocked_by: []
assignee:
---

## What

Give students a visible **Format Code** action that tidies spacing and indentation in the current Script without changing what the code does. Use the editor's existing formatting support if it meets this need.

## Design constraints

- Format only the active Script, preserve cursor and undo behavior, and save through the current code-saving path. Never overwrite other Scripts or a passing snapshot.
- Formatting is optional and does not automatically change code on Run. Keep syntax and type diagnostics separate from formatting.
- Explain clearly when formatting cannot run on incomplete code; leave that code intact.

## Done when

- A student can format valid messy code with one action and undo it once; equivalent code runs the same before and after.
- Incomplete code is preserved with a useful message. The action works in Lessons and Sandbox and has a keyboard-accessible label.
- Browser-check editor focus and undo; `npm run typecheck` and `npm test` pass.
