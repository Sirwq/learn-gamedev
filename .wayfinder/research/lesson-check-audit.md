# VIT-53 lesson check audit

The checks assess observable behavior, not source-code spelling or hostile cheating.

| Lessons | Teaching goal and current evidence |
| --- | --- |
| 1 | Repeated movement reaches a flag; introductory outcome check retained. |
| 2 | Steady travel plus flag within three game seconds; rejects teleport-only completion. |
| 3 | Steering reaches both separated flags. |
| 4 | Falling reaches the ground flag. |
| 5 | Jump clears an enemy; contact loses. |
| 6–8 | Level geometry requires intermediate box/platform/wall traversal; overlap loses inside walls. |
| 9 | Camera follows a long journey; leaving the camera loses. |
| 10 | Every original coin disappears during player contact, with the growing count logged. |
| 11 | Enemy reaches each wall and returns. |
| 12 | Enemy disappears during descending player contact above its midpoint. |
| 13 | Visible bullet travel precedes enemy disappearance at the projected next bullet position. |
| 14 | Hurt/respawn behavior plus completion. |
| 15 | At least 100 pixels of supported shared displacement, then reach the flag. |
| 16 | Sound correlated with jump/coin events, then all coins collected. |
| 17 | Two distinct HUD counts, then all coins collected. |
| 18 | Geometry and spike failure distinguish short/long jumps. |
| 19 | Input after lost support followed by a jump; rejects an expired airborne jump. |
| 20 | Input before landing followed by a jump; excludes stomp bounce. |
| 21 | Hurt and camera shake correlated with respawn, then completion. |

New tests cover alternate steady speeds, alternate log wording, alternate bullet/platform speeds, and remote deletion, stationary bullets, teleport-only movement and platforms moving without carrying. Existing reference playthroughs remain green.

Limits: fixed Time.deltaTime means behavior cannot distinguish `speed * Time.deltaTime` from the mathematically equivalent `speed / 60`. No source matching or variable-timestep engine was added. Coin positions are unique and static in lesson 10. Shooting checks target the current horizontal-bullet, stationary-enemy exercise; one-step bullets with no visible travel are not accepted. Outcome checks elsewhere remain suitable for their supplied geometry, rather than becoming an anti-cheat system.
