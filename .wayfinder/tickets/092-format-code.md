---
title: Add a Format Code action to the editor
label: build
status: closed
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

## Resolution

Added a keyboard-accessible Format Code button for the active Script in Lessons and Sandbox. It checks TypeScript syntax before invoking Monaco's document formatter, leaves incomplete code intact with a clear message, and skips formatting if the Script changes or the editor closes during the check. Monaco keeps the cursor and one undo step; the existing model-change listener saves the edit without touching passing snapshots.

Verified with `npm run typecheck`, `npm test`, and a Chromium browser check of formatting, focus, one-step undo, incomplete-code preservation, and the Sandbox editor.
