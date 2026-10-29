---
title: What do sound and animation add to the engine?
label: wayfinder:grilling
status: closed
blocked_by: [048]
assignee: claude
---

## Question

Animation and sound are Out of scope on the [MVP map](../map.md); sprites are still images that only flip to face ([What is the art style?](014-art-style.md)). If v2 adds them, what does the student write? Cover: Unity-style names (`AudioSource.PlayOneShot`, an `Animator` or plain frame swaps), whether the engine animates walk / jump on its own or the student does, which sounds ship with the app (Kenney has CC0 sound packs too), the Run's audio running in a Web Worker, and a mute button. Are they new Lessons in the Course, Sandbox only, or both?

## Resolution

Grilled with the user; all recommendations accepted, plus the user's own sounds as a later chapter.

- **Sandbox only.** The 15 Course Lessons stay silent and unanimated, as [What is in v2?](048-v2-scope.md) decided. No new Lessons in v2.
- **Animation is the engine's, with no API.** Like facing ([What is the art style?](014-art-style.md)), the engine picks frames from box movement each frame: a walk cycle while a box moves sideways, a jump pose while it moves up, an idle loop for things that don't move. It uses only the frames Kenney's Pixel Platformer pack really has (likely a 2-frame walk and a jump pose for Player and Enemy, maybe a Coin or Flag loop) at about 8–10 fps; nothing new is drawn. A tag with no frames in the pack stays a still image, and own sprites ([How do students bring their own sprites?](050-own-sprites.md)) stay still too. Every frame is stretched onto the box, so drawn shape = hitbox holds. No `Animator`, no frame swaps in student code.
- **Reduced motion** doesn't stop sprite animation: it is game content, small and slow. Reduced motion covers UI transitions such as the menu slide.
- **Sound call**: `this.audio.PlayOneShot("Jump")`, an `audio` field on every Script next to `transform`. Its @unity note says C# writes `GetComponent<AudioSource>().PlayOneShot(clip)`. Clip names are a fixed string union that Monaco autocompletes: `Jump`, `Coin`, `Hit`, `Hurt`, `Shoot`, `Explosion`, `Powerup`, `Win`, `Lose`, `Click`. 📖 Docs gets an entry, as for every API.
- **Which sounds**: one free CC0 pixel / 8-bit sound pack ships with the app, picked in [Which CC0 sound pack ships with v2?](061-sound-pack.md). The names above stay fixed whichever pack wins.
- **Audio path**: the Run's Web Worker can't play audio, so `PlayOneShot` queues the clip name and the frame's message to the page carries it. The page plays it with Web Audio; the Run click unlocks the AudioContext. The same clip played several times in one frame plays once. Sounds stop on Stop and when the game pauses (tab blurred).
- **Mute**: a 🔊 / 🔇 icon button labelled "Mute sound" on the game view, saved with the localStorage settings, sound on by default. No keyboard shortcut: keys belong to the game.
- **Later, not v2**: students' own sounds and background music, taught in a later chapter of Lessons ("How to add your own sounds").
- **Claude Player**: if the Player is redrawn ([What does the Player look like as a Claude sprite?](058-claude-player-sprite.md)), it needs its own walk and jump frames; added to that ticket.

**Amended** by [How do students learn the v2 parts?](062-teaching-v2.md): Chapter 2 Lessons (16 onwards) teach sound, screen text and game feel; Lessons 1–15 are unchanged.
