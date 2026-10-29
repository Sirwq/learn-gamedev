---
title: Course menu: mouse and touch navigation
label: design
status: closed
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

## Resolution

- Round ‹ › buttons (`#menu-prev` / `#menu-next`, 44 px) sit in the gaps on each side of the big card. Their labels are "Previous/Next Lesson" ("… Project" on the Sandbox tab), and they are disabled at the ends. If a button becomes disabled while it has focus, focus moves back to the menu, so Enter still plays.
- The `1 / 15` count is now a row of dots (`#menu-dots`, `role="group"`). Each dot is a button named after its Lesson or Project, and clicking one jumps to that card. With a mouse, Lesson 15 is one click away. Keyboard: the dots use a roving tabindex (one Tab stop), and ← → move along them with focus following.
- Wheel: one gesture moves one card. The next move waits until the wheel has been still for 200 ms. Both horizontal and vertical scroll count, because most mice only have a vertical wheel.
- Touch: a horizontal swipe of 40 px or more on the cards moves one card (`src/swipe.ts`, with a test). The swipe cancels the click on the card it started on. The rail uses `touch-action: pan-y pinch-zoom`, so pinch-zoom still works.
- Coarse pointers: bar buttons and dots are at least 44 px tall. All menu buttons have `touch-action: manipulation`.
- Locked cards behave as before.
- Not checked in a real browser, because there is none in this environment.
