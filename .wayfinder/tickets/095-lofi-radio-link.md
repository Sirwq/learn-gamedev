---
title: Add a Listen to Lofi Radio link
label: build
status: closed
blocked_by: []
assignee:
---

## What

Add an optional **Listen to Lofi Radio** control that opens [lofi.radio](https://lofi.radio/) for students who want background music while coding.

## Design constraints

- Open the official site on an explicit click in a separate tab so the Lesson, code, Run, and saves stay in place. Do not autoplay or embed a third-party stream in the app.
- Make the external destination clear in the label or accessible name and translate the app label through the locale catalog. Place it as a secondary action that does not crowd Run.
- The external site's current behavior is outside the app's control; the app should make no promise that playback will begin automatically.

## Done when

- The control opens the correct destination and the current Lesson remains usable.
- Keyboard and screen-reader users can identify and activate it. Check the layout at narrow width and in both themes; `npm run typecheck` and `npm test` pass.

## Resolution

Added a keyboard-accessible link in the Lesson panel to `https://lofi.radio/`. Its visible English and Russian labels name the destination and new-tab behavior. The link opens only when activated, uses `noopener noreferrer`, and leaves the Lesson and Run in place. No stream is embedded or started by the app.

Verified with `npm run typecheck`, `npm test`, and Chromium checks for keyboard activation, the exact destination and separate tab, the original Lesson's usability, Russian text, and narrow layout in light and dark themes.
