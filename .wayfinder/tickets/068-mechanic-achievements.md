---
title: Double jump, Wall jump and Dash Achievements
label: build
status: open
blocked_by: []
assignee:
---

## What

- The Achievement `Run` gains `keysDown` (this frame's pressed keys, what `Input.GetKeyDown` reads). Checker only; the student API doesn't change. This is where the checker's `world` shape gets chosen (see the "Left alone" note in [064-codebase-architecture.md](064-codebase-architecture.md)); Chapter 2 later adds `sounds` and `labels` the same way.
- Three Achievements, checked in Lessons and Sandbox from day one: ⏫ **Double jump** after First jump ("Jump again in mid-air"), 🧗 **Wall jump** after Bonk ("Jump off a wall"), 💨 **Dash** after Both ways ("Dash: a quick burst of speed"). Tests exactly as written in the spec (airborne, kick, 1 px Wall rule, the Dash speed rule).
- The tiles are always on the map; the counter becomes `🏆 n / 21`. Hand-place their cells; the map may grow.
- Each of the three tile details adds: "Extra: no Lesson teaches this. Build it in your own Player code, in any Lesson or a Sandbox Project."

## Spec

- [056-mechanic-achievements.md](056-mechanic-achievements.md)
- [062-teaching-v2.md](062-teaching-v2.md): the "Extra" line
- [011-achievement-map.md](011-achievement-map.md)

## Done when

- A playthrough test per move with a reference Player that has it.
- A negative test: the Lesson 14 Player stomps, respawns, rides and runs and earns none of the three.
- The menu and map show `n / 21`.
- `npm run typecheck` and `npm test` pass.

## Resolution
