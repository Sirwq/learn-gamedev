---
title: Double jump, Wall jump and Dash Achievements
label: build
status: closed
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

Done. Double jump (⏫, after First jump, cell 7,4), Wall jump (🧗, after Bonk, cell 3,0) and Dash (💨, after Both ways, cell 3,9) are in `src/achievements.ts`, checked everywhere. The map grew one row (13 × 10 cells). Menu and map read `n / 21` from `achievements.length`.

- **Checker shape**: `World` stays an array, so Lesson Goals don't change. The extra data goes on the Achievement `Run`: `keysDown` (this frame's pressed keys, from a new checker-only `keysDown()` in `engine.ts`) and `recent`, the last 72 frames as `{ world, keysDown }`, which the move tests need. The checker now takes `(world, { logged, keysDown })`. Chapter 2 adds `sounds` and `labels` to that object the same way.
- **Tests as in the spec**: *airborne* means the Player stands on no box. Double jump also needs the Player airborne on every frame from the press to the kick ("still airborne"). Without that, a jump on the frame after landing counted.
- **Tile detail**: an `extra` flag on the three adds the "Extra: no Lesson teaches this…" line to the tile's title/label in `main.ts`.
- **Tests**: `achievements.test.ts` has a small reference Player plus one Extra per move. Each move is earned with its Extra and not without it. Holding a higher speed is not a Dash, and a double jump up a wall is not a Wall jump. `course.test.ts` checks that every Lesson's Reference playthrough, including stomp (12), respawn (14) and ride (15), earns none of the three. The same check, with Space pressed every other frame, earns no Wall jump or Dash.
- **Known edge**: the Course Players keep `onGround` after walking off a ledge, so they can jump once in mid-air. The spec's Double jump test counts that, and it shows in Lessons 9 and 10 when Space is mashed. The test was left as written.

