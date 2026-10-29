---
title: Which Achievements reward extra Mechanics?
label: wayfinder:grilling
status: closed
blocked_by: []
assignee: claude
---

## Question

Double jump, wall jump and dash get no Lessons in v2: instead, new Achievements reward a student who builds them on their own ([What is in v2?](048-v2-scope.md)). Achievements are `{ id, after, message, test(world) }` checked every frame ([What does the achievement map look like?](011-achievement-map.md)), and the engine has no physics, so a test only sees box positions frame by frame. Cover: which moves get one (double jump, wall jump, dash, others?), how each test spots the move from positions alone without false hits, where they hang on the tree and whether they start hidden, whether they count only in Sandbox or in Lessons too, and the new `n / 18` total.

## Resolution

**Three new Achievements, earned anywhere, on the map from the start: `🏆 n / 21`.**

- **Moves**: Double jump, Wall jump, Dash. No others (ground pound, wall slide, glide and coyote time are not in v2).
- **Where**: checked everywhere, in Lessons and Sandbox Projects, from day one, with the normal toast. v2 isn't a secret, just what comes after the basic Course.
- **Map**: the three tiles are always on the map; the counter is `n / 21` from the start. Tile state follows the usual rule (hidden `?` → grey → gold). Cells hand-placed at build time; the map may grow a column or row.
- **Tree, titles, icons**:
  - ⏫ **Double jump** after First jump: "Jump again in mid-air".
  - 🧗 **Wall jump** after Bonk: "Jump off a wall".
  - 💨 **Dash** after Both ways: "Dash: a quick burst of speed".
- **Keys for tests**: the Achievement `Run` gains `keysDown`, this frame's pressed keys (what `Input.GetKeyDown` reads). Checker only; the student API doesn't change.
- **Tests** (*airborne* = the Player stands on no box; *kick* = this frame's upward step is at least 3 px bigger than last frame's):
  - **Double jump**: Space pressed while airborne, then a kick within 3 frames while still airborne, with no Enemy gone and no jump back to the start (so a stomp bounce or a respawn doesn't count).
  - **Wall jump**: Space pressed while airborne and touching a Wall's side (Bonk's 1 px rule), then within 10 frames the Player is rising and at least 20 px from that side.
  - **Dash**: on a key-press frame, horizontal speed goes above both 2× its average over the previous 10 frames and 600 px/s, stays there for at least 4 frames, and drops back within 1 s; not while standing on a Platform that moved. A higher `speed`, a respawn teleport or a ride doesn't count.
- **Done when** (for the build): a playthrough test per move with a reference Player that has it, and a negative test where the Lesson-14 Player stomps, respawns, rides and runs and earns none of the three.
- **Wording**: "secret" was reworded to "after the Course" on the v2 map and in [What is in v2?](048-v2-scope.md). The Sandbox unlock itself is unchanged ([How does Sandbox mode work?](015-sandbox-mode.md)).
