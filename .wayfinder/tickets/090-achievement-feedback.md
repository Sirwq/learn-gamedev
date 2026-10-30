---
title: Keep Achievement notices readable and play an unlock sound
label: build
status: open
blocked_by: []
assignee:
---

## What

When a student earns an Achievement, keep its notice visible long enough to read and play a short, distinct sound once. The existing Achievement map and saved progress keep working.

## Design constraints

- Give Achievement notices their own readable lifetime instead of the shared four-second toast fade. Keep the notice usable with reduced motion and when several Achievements arrive together; do not let notices cover the Run and Stop controls indefinitely.
- Play only on a newly earned Achievement, not on reload, backup import, map opening, or replaying an already earned one. Respect the saved mute setting and browser audio restrictions. The sound must not drown out lesson audio.
- Keep the text visible to assistive technology and translated through the current locale.

## Done when

- A student can read the full title and description before the notice leaves; several notices remain individually readable.
- A newly earned Achievement makes one audible cue when sound is enabled and none when muted or already earned.
- Check earning in a Lesson and Chapter 2 or Sandbox in a browser, including reduced motion. `npm run typecheck` and `npm test` pass.
