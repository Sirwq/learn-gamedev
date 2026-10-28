---
title: How does a Check work?
label: wayfinder:grilling
status: closed
blocked_by: [002]
assignee: vivy
---

## Question

What does a Check inspect (game state after N frames, simulated key presses, student function return values), when does it run (on Run, continuously, on Submit), and what does the student see on pass/fail?

Constraint from [What game API does the student code against?](002-game-api.md): the student's code carries over between Lessons, so a bug in an earlier Mechanic (for example a broken move) can make a later Check fail. Should a Check test only the new Mechanic, or the whole game? Checks run inside the game's worker ([How do we run student TypeScript safely in the browser?](001-run-student-ts.md)).

## Resolution

A Check watches the **live game** while the student plays with the keyboard. There is no scripted input and no separate Check button.

- **Goals**: each Lesson has 1 or more Goals (reach the flag, destroy all enemies). Each frame, inside the game worker, the Check tests simple conditions on game state (player overlaps the flag, 0 objects tagged `Enemy`). The Lesson passes when every Goal is met **in the same Run**.
- **Only the current Lesson** is tested. Earlier Lessons are assumed fine once passed, and there are no regression checks. A student who cheats will struggle in later Lessons anyway.
- **No anti-cheat.** Lesson authors design each Level so its Goal needs the new Mechanic (for example a wall too high to pass without jumping).
- **Feedback**: a checklist of Goals, ⬜ not yet or ✓ done, never ✗. A Lesson can define **Lose events** (fell off the screen, touched an enemy). These stop the game with a plain message ("You fell off the screen. Press Run to try again."). Run or a Lose event resets every ✓ to ⬜. Runtime errors keep their editor markers.
- **On pass**: the Lesson is marked passed in localStorage and stays passed even if later code breaks it. A **Next Lesson** button appears. Each file of that Lesson gets a **Compare** view: a read-only side-by-side diff of the student's code against the Reference code (Monaco's diff editor), with **Load reference code** inside it.

New Glossary terms: Goal, Lose event, Level.
