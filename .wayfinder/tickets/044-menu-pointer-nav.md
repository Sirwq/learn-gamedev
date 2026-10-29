---
title: Course menu: mouse and touch navigation
label: design
status: open
blocked_by: [043-menu-keyboard-sr]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark look of the Course menu. User-friendliness first, looks second. Out of scope: the cover art on the cards and the blurred background (the user has its own plan for those).

## What

With a mouse, the only way to move is clicking the next side card. Reaching Lesson 15 takes 14 clicks, and cards past the right edge can't be seen or reached. There is no wheel or swipe.

- Add visible previous / next buttons beside the big card (`aria-label` "Previous Lesson" / "Next Lesson"), disabled at the ends.
- Horizontal wheel / trackpad scroll and touch swipe move one card at a time. Arrow buttons and keys stay the fallback, so this isn't the only way.
- The bottom count `1 / 15` turns into a row of small dots, or stays text but becomes clickable to jump to a card. Pick whichever is simpler, as long as it's reachable with the keyboard.
- Hit targets: bar buttons are 32 px tall. Make them at least 44 px on coarse pointers (`@media (pointer: coarse)`), and use `touch-action: manipulation`.
- Clicking a locked card focuses it, and only Play shows "Pass Lesson N first". That's fine. Keep it.

## Done when

- Lesson 15 is reachable in a few clicks or one swipe.
- `npm run typecheck` and `npm test` pass.
