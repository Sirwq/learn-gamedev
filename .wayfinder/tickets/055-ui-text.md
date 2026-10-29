---
title: What on-screen UI text does the student write?
label: wayfinder:grilling
status: closed
blocked_by: []
assignee: claude
---

## Question

In the MVP, scores and debug output go to the Console; there is no on-screen text ([What is the first Course?](005-first-course.md)). v2 adds UI text in Sandbox ([What is in v2?](048-v2-scope.md)). What does the student write? Cover: Unity-style names (a `Text` component, `UI.Text`, `TextMeshPro`-like, or a simpler call), whether text is a box in the Level or drawn over the screen (stays put when `Camera.main` moves), how it is placed (anchors? pixel x, y?), the pixel font and its licence, sizes and colours, and whether it can be placed with the Level editor ([How does the Level editor work?](049-level-editor.md)).

## Resolution

Grilled with the user; all recommendations accepted, plus a switch for the outline.

- **Sandbox only.** Lessons keep "no on-screen HUD, use the Console" ([What is the first Course?](005-first-course.md)).
- **Screen text only.** UI text draws over the game view, above every box, and doesn't move or zoom with `Camera.main`. No text placed in the world (signs, labels over an Enemy) in v2.
- **Unity's immediate-mode GUI**: a new optional Script method `OnGUI()`, called every frame after `Update`, in which `GUI.Label(new Rect(x, y, w, h), text)` draws one label for that frame. No components, no `GetComponent`, nothing to create or destroy. `Rect` is new.
  ```ts
  OnGUI() {
    GUI.Label(new Rect(16, 16, 300, 30), "Coins: " + this.coins);
  }
  ```
- **Rect coordinates as in Unity**: x, y from the top-left of the 960×540 view, y growing down, scaled with the game view. The @unity note and 📖 Docs point out that this is the other way up from the world (bottom-left, y up).
- **Style**, all reset to the defaults at the start of every `OnGUI` (the @unity note says Unity keeps them between frames):
  - `GUI.color = Color.yellow`: a new `Color` with named constants (white, black, red, yellow, green, blue…) and `new Color(r, g, b)` with 0–1 values. Default white.
  - `GUI.skin.label.fontSize = 32`: rounded to a whole multiple of the font's pixel size so it stays crisp.
  - `GUI.skin.label.alignment = TextAnchor.MiddleCenter`: all 9 `TextAnchor` values, placing the text inside its Rect. Default `UpperLeft`.
  - `GUI.skin.label.outline = false`: a 1 px dark outline keeps text readable on any background; on by default. Not Unity: the @unity note says C# adds an `Outline` component to a UI Text instead.
  - No `GUIStyle` objects.
- **Font**: one CC0 pixel font from Kenney's Fonts pack (the KenPixel family), bundled with the app and drawn with smoothing off. No font choice in the API.
- **Lines**: `\n` starts a new line; no automatic word wrap and no clipping, so text never silently disappears. `w` and `h` only matter for alignment.
- **Runtime**: the worker collects the frame's labels and sends them with the frame message; the page draws them over the game. Text shows only while running, stays frozen with the last frame on pause, and is gone on Stop.
- **Level editor**: doesn't place UI text; it exists only in code.
- **Screen readers**: a visually hidden list beside the game view holds the current labels. It updates only when the text changes and is not a live region, so a ticking timer isn't announced every second.

**Amended** by [How do students learn the v2 parts?](062-teaching-v2.md): Chapter 2 Lessons (16 onwards) teach sound, screen text and game feel; Lessons 1–15 are unchanged.
