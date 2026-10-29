---
title: Screen text with OnGUI and GUI.Label
label: build
status: closed
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

- **Engine** (`src/engine.ts`): `OnGUI?()` on MonoBehaviour, called for every live Script after Update and the end-of-frame sweep. `GUI.Label` pushes onto the exported `labels` array (emptied each frame). `GUI.color` and `GUI.skin.label` (`fontSize` 32, `UpperLeft`, `outline` true) reset before each Script's `OnGUI`. fontSize rounds to a multiple of 16 (Kenney Pixel's outlines sit on a 1/16 em grid), minimum 16. `Rect`, `Color` (Unity's values, including yellow 1/0.92/0.016) and a string-valued `TextAnchor` are now globals. `startGame` takes a `gui` flag; the worker passes `v2Features`, so Lessons 1–15 never call OnGUI.
- **Typings/Docs**: `GUI`, `GUISkin`, `GUIStyle`, `Rect`, `Color` and `TextAnchor` are in `engine-api.d.ts` with @unity notes (y-down vs world y-up, style kept between frames in Unity, `Outline` component). They get their own 📖 Docs pages.
- **Runtime**: a new `{ type: "labels" }` FromWorker message, sent only when the frame's labels change, so pause freezes them for free. `src/gui.ts` lays out each line by TextAnchor, draws the 1 px dark outline in 8 directions, and draws onto a 960×540 `#gui` overlay canvas (pixelated, pointer-events none) over the game. `stop()` (and so each new Run) clears it.
- **Screen readers**: a `.sr-only` `#gui-text` list, not a live region. `textList` only rewrites it when the texts change.
- **Font**: `public/fonts/KenneyPixel.ttf` from Kenney Fonts, with its CC0 `LICENSE.txt` copied unchanged plus a README. It is loaded with `FontFace` only in Sandbox / Chapter 2 (`DOM.Iterable` added to tsconfig for `document.fonts.add`).
- Not checked in a real browser (none in this environment), so glyph crispness and the outline look were not seen.
