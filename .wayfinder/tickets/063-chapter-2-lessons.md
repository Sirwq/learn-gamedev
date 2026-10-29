---
title: Which Lessons make up Chapter 2?
label: wayfinder:grilling
status: closed
blocked_by: [062]
assignee: claude
---

## Question

[How do students learn the v2 parts?](062-teaching-v2.md) added a Chapter 2 of real Lessons after Lesson 15, teaching `this.audio.PlayOneShot` ([What do sound and animation add to the engine?](054-sound-animation.md)), `OnGUI` / `GUI.Label` ([What on-screen UI text does the student write?](055-ui-text.md)) and game feel, but not Double jump, Wall jump or Dash (Achievements only, [Which Achievements reward extra Mechanics?](056-mechanic-achievements.md)). Which Lessons, in what order, and how many (`m` in `Ch. 2 n / m`)? For each: the concept, its fixed Level, its Goals and Lose events, and how the checker tests it. Cover: which game-feel tricks make the cut (variable jump height, coyote time, jump buffering, screen shake, landing / hit sounds, others), whether game-feel Goals can be checked from frames and keys like the Mechanic Achievements, how Goals see sounds (the clip names the worker already sends each frame) and screen text (the hidden label list), and whether Chapter 2 builds on the student's own Chapter 1 Player code or starts each Lesson from a stub.

## Resolution

**Six Lessons, 16–21, on top of the student's own Chapter 1 code: `Ch. 2 n / 6`.**

- **Code carries on**: as in Lessons 2–15, each Lesson starts from the student's own code. Lesson 16's hidden stub is the Lesson 15 Reference code, and a student whose code is a mess loads Reference code as usual.
- **Checking**: the Level forces the move where it can, as in Chapter 1. Where it can't, Goals use frame and key rules like [Which Achievements reward extra Mechanics?](056-mechanic-achievements.md) (`keysDown`, *airborne*, *kick*). Times are in seconds, not frames. The checker's read-only `world` gains `sounds` (this frame's clip names, which the worker already sends) and `labels` (this frame's `GUI.Label` texts and rects, the same list the screen readers get). Both are checker only; the student API doesn't change.
- **Guidance**: Lessons 16 and 17 give the new API's first line in full, because clip names must match exactly. Lessons 18–21 go back to the Lesson 9–15 level: describe the feel, name the API, up to three Hints. Every Explanation keeps its "Differs from Unity C#" note.
- **The Lessons** (numbers come from the Lesson 14 Player: a full jump rises about 120 px over 0.8 s, it runs at 400 px/s and the ground stops it at y = 40; exact heights are tuned at build):
  - **16 Sounds** (`this.audio.PlayOneShot`). One screen: five coins, one of them on a platform, and a flag. Goals: "Play Jump when you jump" (the Player starts rising and `Jump` plays in that frame or the next), "Play Coin when you pick up a coin" (the Coin count drops and `Coin` plays in that frame or the next), "Collect all coins". Lose: off screen. No landing sound: there is no `Land` clip and the ten names stay as decided in [What do sound and animation add to the engine?](054-sound-animation.md).
  - **17 Coin counter** (`OnGUI` + `GUI.Label`, y-down). A new `HUD.ts` (stub = empty class), as in the Sandbox tour: it finds the Player and draws `"Coins: " + coins`. Lesson 16's coin layout. Goals: "Show your coins on screen" (a label inside the screen holds the right count as a whole number at two different counts, so fixed text can't pass), "Collect all coins".
  - **18 Short and long jumps** (`Input.GetKeyUp`, variable jump height). The Level forces it: a low Wall to hop over, with Spikes hanging above it that a full jump hits and a short hop clears, then a tall platform with the flag that needs a full jump. The Explanation suggests halving `velocityY` when Space is released while rising. Goal: "Reach the flag". Lose: Spikes, off screen.
  - **19 Coyote time** (a timer field). Also closes the Lesson 7 gap (`onGround` stays true after walking off). Platforms over Water. *Walk-off* = leaving a box's top without a kick. Goal "Jump just after running off an edge": Space pressed 0.02–0.1 s after a walk-off, then a kick. Lose "You jumped long after leaving the edge": a kick more than 0.25 s after a walk-off with no jump in between. It is counted only after a walk-off, never after a jump, so a Double jump Player is fine. Goal "Reach the flag". Lose: Water, off screen.
  - **20 Jump buffering** (remembering a press). Goal "Press jump just before you land": Space pressed while falling at most 0.1 s before touching down, then a kick within one frame of landing; stomp bounces don't count. Goal "Reach the flag" over a few low steps. Lesson 19 code ignores early presses, so it fails.
  - **21 Screen shake** (moving `Camera.main` for a moment) plus `Hurt`. No `Random` in the API: an alternating ±6 px offset that shrinks over about 0.3 s, using a timer field. Spikes to cross, a flag past them, 3 health. Goal "Get hurt: play Hurt and shake the screen": a respawn (Lesson 14's rule), `Hurt` in that frame or the next, and within 0.5 s the camera's offset from the Player flips sign at least 3 times with at least 2 px each way, then settles within 1 s. Goal "Reach the flag".
- **Left out**: a landing sound, health on screen, squash and stretch, hit-stop, particles, a `Random` API.
- **The engine stays quiet**: no `Win` on pass and no `Lose` on a Lose event; only student code makes sound. Chapter 1 stays silent.
- **Done when** (for the build): as in Chapter 1, each Lesson's Reference code passes with a scripted key plan and the previous Lesson's Reference code alone doesn't. Also, a reference Player with Double jump passes Lesson 19 without the mid-air Lose event, and the Lesson 16–21 Reference Players earn none of the Mechanic Achievements.
