---
title: What does the Player look like as a Claude sprite?
label: wayfinder:prototype
status: open
blocked_by: []
assignee:
---

## Question

The Player is one pixel-art PNG (`src/sprites/Player.png`, 20×23) stretched exactly onto its box, so drawn shape = hitbox, and it flips to face its last horizontal movement ([What is the art style?](014-art-style.md)); the art now comes from Kenney's CC0 Pixel Platformer pack. We want the character redrawn as Claude's orange pixel mascot. Prototype it in the game view and on a Lesson cover ([What does the Course menu look like?](012-course-menu.md)). Cover: the sprite's size and proportions against the Player boxes in the Lessons (no squash, nothing sticking out of the hitbox), how it reads flipped and at cover zoom, whether its palette sits with the Kenney tiles and the night sky, whether the Enemy or other tags change to match, and whether the mascot may be used here (it is Anthropic's, not CC0) or needs to be an original look-alike. Also cover walk and jump frames in the same style: in Sandbox the engine animates the Player from the pack's frames ([What do sound and animation add to the engine?](054-sound-animation.md)), so a redrawn Player needs its own.
