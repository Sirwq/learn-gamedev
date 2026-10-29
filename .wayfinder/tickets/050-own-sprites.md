---
title: How do students bring their own sprites?
label: wayfinder:grilling
status: closed
blocked_by: [048]
assignee: claude
---

## Question

The art is one sprite per tag, stretched exactly onto its box so drawn shape = hitbox ([What is the art style?](014-art-style.md)); it now comes from Kenney's Pixel Platformer pack. Its prototype showed a "my image for [tag]" picker works on the same boxes. How does a student swap in their own art? Cover: per Project or everywhere, per tag or per box, new tags with their own sprite, tiled tags (Ground, Wall, Water) versus stretched ones, whether drawn shape = hitbox still holds for any image, size and file-type limits, pixel-art smoothing, and whether the Course Levels can use them or only Sandbox.

## Resolution

**Per Project, per tag, set in the Level editor inspector. Sandbox only.**

- **Where**: Sandbox Projects only. Course Levels and Lesson covers always use the shipped Kenney art.
- **Per Project**: an imported image belongs to one Project. Duplicate copies it, and the Project's export file carries it. No shared image library; to reuse art, duplicate the Project or import the file again.
- **Per tag**: the tag still picks the sprite, so every box of a tag looks the same; two looks means two tags. One image per tag (plus its optional Top image); replacing it drops the old file.
- **New tags**: "+ New tag…" offers **Image…** (pick a file) or **Colour** (a plain box, as now). A new image tag draws stretched.
- **Built-in tags** (Player, Coin, Ground, Water…) can get an own image in a Project; **Reset to default** brings the Kenney art back.
- **Drawn shape = hitbox** still holds: the image is stretched exactly onto its box; transparent margins are the student's choice, not a separate hitbox. A **Match image shape** button keeps the box's width and sets its height from the image's aspect ratio. Own sprites flip to face left like the built-in ones, so students draw them facing right.
- **Draw: Stretch or Tile**, per tag. Tile makes the image one 20×20 world-px cell repeated across the box (matching the 20 px snap), with an optional **Top** image for the first row (grass on dirt, the surface of water); without one, the main image fills every row. Built-in tags start in the mode they have today (Ground, Platform, Wall, Water, Spikes tile; Player, Enemy, Coin, Flag, Bullet stretch). Spikes' one-row style stays built-in only.
- **Files**: PNG and JPEG only. Anything over 256×256 is scaled down to fit on import; stored as PNG.
- **Pixel art** toggle per image, on by default (smoothing off, as now); off smooths drawings or photos.
- **Controls**: all in the inspector under Tag: thumbnail, **Change image…** (file picker, or drop a file on the thumbnail), Reset / Remove image, Draw (Stretch / Tile), Match image shape; Pixel art and the Top slot behind a "More" button. The tag palette shows the new image.
- **Undo**: every image change (set, replace, reset, Draw, Pixel art) is one Ctrl+Z step like any inspector change. The editor is locked during Run, so images never change mid-Run.
- **No new code API**: a tag spawned with `Instantiate` gets its image automatically. Switching sprites from code is left to [What do sound and animation add to the engine?](054-sound-animation.md).

**Out of scope**: an in-app sprite editor. Students import only; 📖 Docs point to free tools such as Piskel or Aseprite.
