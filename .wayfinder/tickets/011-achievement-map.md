---
title: What does the achievement map look like?
label: wayfinder:prototype
status: open
blocked_by: []
assignee:
---

## Question

An **Achievements** button opens a full map: a tree of icon tiles joined by arrows, like the [reference screenshot](../assets/achievement-map-reference.png) (our own art, not copied). When the student does something for the first time (first jump, first stomp, first coin) or passes a Lesson, a toast pops up in a corner, like Minecraft or PlayStation. Prototype it: where the button sits in the [app shell](006-app-shell.md), the toast, locked vs unlocked tiles, how the tree follows the 15 Lessons of [What is the first Course?](005-first-course.md). Leaning: an achievement is `{ message, test(world) }` like a Goal, checked every frame by the Check machinery, saved in localStorage.
