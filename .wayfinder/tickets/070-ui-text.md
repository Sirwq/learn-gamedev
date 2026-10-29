---
title: Screen text with OnGUI and GUI.Label
label: build
status: open
blocked_by: []
assignee:
---

## What

- **API**: optional `OnGUI()` on Scripts, called every frame after `Update`. `GUI.Label(new Rect(x, y, w, h), text)` draws one label for that frame. New `Rect`, `Color` (named constants + `new Color(r, g, b)`, 0–1), `TextAnchor` (all 9). Style: `GUI.color`, `GUI.skin.label.fontSize` (rounded to a crisp multiple), `.alignment` (default `UpperLeft`), `.outline` (1 px dark, on by default). All reset at the start of every `OnGUI`. Doc comments with the @unity notes from the spec (y-down vs world y-up, Unity keeps style between frames, C# uses an `Outline` component).
- **Coordinates**: top-left of the 960×540 view, y down, scaled with the game view, unaffected by `Camera.main`.
- **Font**: one Kenney CC0 pixel font (KenPixel family) bundled with the app, drawn with smoothing off, with its licence next to it. `\n` starts a new line; no wrap, no clipping.
- **Runtime**: the worker collects the frame's labels and sends them with the frame message (a new `FromWorker` member). The page draws them over every box. Shown only while running, frozen on pause, gone on Stop.
- **Screen readers**: a visually hidden list beside the game view with the current labels, updated only when the text changes, not a live region.
- **Where**: Sandbox and Chapter 2 Lessons only; in Lessons 1–15 nothing is drawn.

## Spec

- [055-ui-text.md](055-ui-text.md)
- [062-teaching-v2.md](062-teaching-v2.md)

## Done when

- Tests: labels collected per frame with style reset each frame; `TextAnchor` placement inside a Rect; the spec's `"Coins: " + this.coins` example type-checks; Lessons 1–15 draw no labels; the hidden list doesn't change when the text is the same.
- `npm run typecheck` and `npm test` pass.

## Resolution
