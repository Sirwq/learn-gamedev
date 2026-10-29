---
title: Which Achievements reward extra Mechanics?
label: wayfinder:grilling
status: open
blocked_by: []
assignee:
---

## Question

Double jump, wall jump and dash get no Lessons in v2: instead, new Achievements reward a student who builds them on their own ([What is in v2?](048-v2-scope.md)). Achievements are `{ id, after, message, test(world) }` checked every frame ([What does the achievement map look like?](011-achievement-map.md)), and the engine has no physics, so a test only sees box positions frame by frame. Cover: which moves get one (double jump, wall jump, dash, others?), how each test spots the move from positions alone without false hits, where they hang on the tree and whether they start hidden, whether they count only in Sandbox or in Lessons too, and the new `n / 18` total.
