---
title: What is the art style?
label: wayfinder:prototype
status: closed
blocked_by: []
assignee: vivy
---

## Question

A Level is a list of coloured boxes `{ tag, x, y, w, h, color, script? }` ([What is the Lesson file format?](004-lesson-format.md)), and the student's code moves boxes. How does the game look beyond plain rectangles, while the student still reasons in boxes? Prototype it: the player, platforms, walls, coins, enemy, bullet, flag and the background, on the 960×540 viewport, and the Lesson cover art on the Course menu ([What does the Course menu look like?](012-course-menu.md)). Decide whether art is drawn by code (shapes, gradients) or loaded sprites, and whether the student's hitbox can differ from what is drawn.

## Resolution

**Pixel art sprites** (variant B of the prototype, branch `prototype/art-style`, commit `30f2422`). Never merged.

- **Sprites, not code-drawn shapes.** One small pixel-art PNG per tag (Player, Enemy, Coin, Flag, Bullet), plus 8×8 tiles for Ground, Platform and Wall. They ship with the app, not in Lesson folders. The `tag` of a box picks its sprite.
- **Drawn shape = hitbox, always.** A sprite is stretched exactly onto its box, with image smoothing off so pixels stay sharp. Tiled tags repeat their tile across the box. No separate hitbox, no art sticking out: the student's box is what they see.
- **Facing**: the Player and Enemy sprites flip to face their last horizontal movement. The engine does this, not student code.
- **`color`** in the Level box ([What is the Lesson file format?](004-lesson-format.md)) stays as the fallback for a tag with no sprite.
- **Background**: one fixed pixel night sky (stars, blocky skyline) behind every Level.
- **Lesson covers** ([What does the Course menu look like?](012-course-menu.md)): the Lesson's Level in the same pixel style, cropped and zoomed around the Lesson's subject, with "LESSON n" and its name at the bottom over a dark fade.

**Out of scope**: students loading their own artwork. Later version. The prototype has a "my image for [tag]" picker that showed it works with any image on the same boxes.
