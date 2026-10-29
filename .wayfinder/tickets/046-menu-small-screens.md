---
title: Course menu on small screens
label: design
status: open
blocked_by: [045-menu-motion]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark look of the Course menu. User-friendliness first, looks second. Out of scope: the cover art on the cards and the blurred background (the user has its own plan for those).

## What

- `index.html` has no `<meta name="viewport" content="width=device-width, initial-scale=1">`. A phone renders the page 980 px wide and zooms it out, so the menu becomes tiny. Add it, and don't disable zoom.
- The top bar (`Q` chips `E` + stats) needs about 945 px, so on a 768 px tablet it runs off the screen. On narrow screens, let the stats move under the chips (or show only the numbers) and hide the `<kbd>` hints on `pointer: coarse`.
- The bottom bar (Back · count · Achievements · Play) must not overlap. On narrow screens, make Play a full-width primary button, and turn Back / Achievements into icon buttons with an `aria-label`.
- Account for the notch: add `env(safe-area-inset-*)` padding to both bars.
- Check that the layout holds at 768, 1024, 1280 and 2560 px (ultra-wide: zoom to 50%).

Phones are not a target (user decision): the editor is too hard to use there. On a phone-sized screen (under ~600 px wide), show a short "learn-dev works best on a computer" note over the menu, but keep the menu usable behind it. Tablets and small laptops are the real targets.

## Done when

- No horizontal scroll at 768 px, and every control is visible and tappable.
- At 375 px the "works best on a computer" note shows and nothing overflows behind it.
- `npm run typecheck` and `npm test` pass.
