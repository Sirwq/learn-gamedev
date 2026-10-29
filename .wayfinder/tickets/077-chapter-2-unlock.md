---
title: Chapter 2 on the Course menu and in the checker
label: build
status: open
blocked_by: [069-sound, 070-ui-text, 068-mechanic-achievements]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

The frame Lessons 16–21 slot into, without the Lessons themselves:

- **Unlock**: Chapter 2 opens with Sandbox when Lesson 15 is passed. Toast "🔓 Sandbox and Chapter 2 unlocked"; the menu still slides to Sandbox.
- **Course menu**: the Lesson path continues after Lesson 15 with a small "Chapter 2" label, hidden until unlock. Stats: `✓ n / 15` stays Chapter 1; after unlock `✓ n / 15 · Ch. 2 n / m`. The Lesson strip says `Ch. 2 n / 6` for these Lessons.
- Chapter 2 Lessons turn on sound (ticket 069), screen text (070) and animation (067 if done) like Sandbox does.
- **Checker**: the read-only `world` gains `sounds` (this frame's clip names) and `labels` (this frame's `GUI.Label` texts and rects), next to the `keysDown` ticket 068 added. Checker only; the student API doesn't change.
- Times in Chapter 2 Goals are in seconds.
- Backups (ticket 073, if done) treat Chapter 2 Lessons like any other.

## Spec

- [062-teaching-v2.md](062-teaching-v2.md): Unlock, Course menu
- [063-chapter-2-lessons.md](063-chapter-2-lessons.md): Checking

## Done when

- Tests: the label, path and `Ch. 2` stat are hidden before Lesson 15 and shown after; a Goal can read `world.sounds` and `world.labels`; Lessons 1–15 still get no sounds or labels.
- `npm run typecheck` and `npm test` pass.

## Resolution
