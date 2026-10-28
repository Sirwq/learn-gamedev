---
title: What does the achievement map look like?
label: wayfinder:prototype
status: closed
blocked_by: []
assignee: vivy
---

## Question

An **Achievements** button opens a full map: a tree of icon tiles joined by arrows, like the [reference screenshot](../assets/achievement-map-reference.png) (our own art, not copied). When the student does something for the first time (first jump, first stomp, first coin) or passes a Lesson, a toast pops up in a corner, like Minecraft or PlayStation. Prototype it: where the button sits in the [app shell](006-app-shell.md), the toast, locked vs unlocked tiles, how the tree follows the 15 Lessons of [What is the first Course?](005-first-course.md). Leaning: an achievement is `{ message, test(world) }` like a Goal, checked every frame by the Check machinery, saved in localStorage.

## Resolution

Prototype: [achievement-map.prototype.html](../../prototypes/achievement-map.prototype.html) on the throwaway branch `prototype/achievement-map` (never merged). Round 1 tried three layouts with Lessons on the map; the student picked the tree, then took Lessons **off** it. Round 2 is the answer.

- **Lessons are not on the map.** Passing a Lesson is not an Achievement; picking and replaying Lessons happens on a separate Course menu screen ([What does the Course menu look like?](012-course-menu.md)).
- **Button**: `🏆 4 / 18` in the top bar, after the Lesson counter. It opens the map over the whole window; ✕ or Esc closes it.
- **Look** (after the [reference screenshot](../assets/achievement-map-reference.png), our own art): a dark blocky background, square bevelled tiles with one icon each, joined by right-angled arrows. An arrow turns green once the tile it points to is earned.
- **Tree**: each Achievement has one `after`, the Achievement that unlocks it; First steps is the root. 18 Achievements: First steps → Hello Console, Both ways, Long way down → First jump → Touchdown → Bonk, Platform hopper → Along for the ride, Off the edge → First coin → Collector, and It's alive → First stomp, Pew → Sharpshooter, Ouch → Second chance. Tile positions are hand-placed per Achievement.
- **Tiles** have three states: **earned** (gold), **locked** (grey: the one before it is earned, so it can be earned now), **hidden** (`?`: further on). Hover shows the title and how to earn it.
- **Toast**: top-right corner of the window, square bevelled frame, "Achievement unlocked" + icon + title, slides in, stacks, gone after ~4 s.
- **Rules**: an Achievement is `{ id, after, message, test(world) }` like a Goal, checked every frame by the Check machinery in any Lesson. Only locked ones (the one before is earned) are checked, so the tree order holds. One missed earlier can still be earned later. Earned once, saved in localStorage with progress.
