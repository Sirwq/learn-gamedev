---
title: What does the Player look like as a Claude sprite?
label: wayfinder:prototype
status: closed
blocked_by: []
assignee: claude
---

## Question

The Player is one pixel-art PNG (`src/sprites/Player.png`, 20×23) stretched exactly onto its box, so drawn shape = hitbox, and it flips to face its last horizontal movement ([What is the art style?](014-art-style.md)); the art now comes from Kenney's CC0 Pixel Platformer pack. We want the character redrawn as Claude's orange pixel mascot. Prototype it in the game view and on a Lesson cover ([What does the Course menu look like?](012-course-menu.md)). Cover: the sprite's size and proportions against the Player boxes in the Lessons (no squash, nothing sticking out of the hitbox), how it reads flipped and at cover zoom, whether its palette sits with the Kenney tiles and the night sky, whether the Enemy or other tags change to match, and whether the mascot may be used here (it is Anthropic's, not CC0) or needs to be an original look-alike. Also cover walk and jump frames in the same style: in Sandbox the engine animates the Player from the pack's frames ([What do sound and animation add to the engine?](054-sound-animation.md)), so a redrawn Player needs its own.

## Resolution

**B, an original orange critter**, replaces the Kenney Player everywhere (Lessons and Sandbox). Prototype: branch `prototype/claude-player`, commit `3c1740b`, page `prototype/claude-player.html`. Never merged.

- **Look**: our own design in a Claude-like palette (orange `#D97757`, shade `#A9583E`, highlight `#F2A98A`, near-black `#1F1A17` eyes with white): round body, two big eyes looking the way it faces, an antenna nub, stubby feet. Not Anthropic's mascot, no logo, no "Claude" name on it.
- **Size**: 16×16 pixel art drawn at 2× onto the 32×32 Player box every Lesson uses. It fills the box from antenna to feet, so drawn shape = hitbox holds with no squash and nothing sticking out. Lessons keep their boxes.
- **Facing**: flipped by the engine as today; the eyes carry the direction and read at 1×, 2× and cover zoom.
- **Frames**: idle, walk1, walk2, jump (feet tucked), in the same style. Sandbox animates them ([What do sound and animation add to the engine?](054-sound-animation.md)); Lessons draw idle only. Reset in the inspector ([How do students bring their own sprites?](050-own-sprites.md)) goes back to this critter.
- **Palette**: sits well on the Kenney sky and grass. Close to the Brick wall's orange-brown, so it blends a little in front of a Wall; the final art may darken the shade or add an outline.
- **Enemy and other tags**: unchanged, Kenney's CC0 art.
- **Licence**: drawn by us, so it ships with the app under the project's own licence; no Anthropic asset is used.

**Out of scope**: a Player that looks like Anthropic's Claude mascot (variants A / A2 in the prototype). It comes back only if Anthropic's brand terms are checked first and allow it.
