---
title: What is the first Course?
label: wayfinder:grilling
status: closed
blocked_by: [002]
assignee: claude
---

## Question

The ordered list of Lessons for the TypeScript Course: which Mechanic each one teaches, which coding concept it introduces (variables, if, functions, arrays, classes…), and how difficulty rises. How many Lessons in the MVP?

Constraint from [What is the Lesson file format?](004-lesson-format.md): the engine has a Unity-style `Camera.main` with no auto-follow, so "camera follows the player" is a candidate Mechanic. Levels before that Lesson must fit on one 960×540 screen.

## Resolution

**Genre**: a side-scrolling platformer. The Course runs until every major platformer Mechanic is covered: **15 Lessons**.

| # | Mechanic | New concept |
|---|---|---|
| 1 | Move right | statements, numbers |
| 2 | Speed | variables (fields) + `Time.deltaTime`; `Debug.Log` introduced as a tool |
| 3 | Steer | `if` + `Input.GetKey` |
| 4 | Gravity | changing a value over time, comparisons |
| 5 | Jump | booleans + `&&` |
| 6 | Land on a box | functions (student writes `Overlaps(a, b)`) |
| 7 | Many platforms | arrays + `for` loop |
| 8 | Walls (side collision) | `else if` |
| 9 | Camera follow | reading another object (`Camera.main`) |
| 10 | Coins | `Destroy` + counting; log the count with `Debug.Log` |
| 11 | Enemy patrol | a new class / Script (`Enemy.ts`) |
| 12 | Stomp vs get hurt | comparing positions |
| 13 | Shooting | `Instantiate` + `Bullet.ts` |
| 14 | Health and respawn | `Start()` state + resetting |
| 15 | Moving platforms | applying another object's motion |

Levels 1–8 fit on one 960×540 screen.

**Rules**
- Each Lesson adds one Mechanic and **at most one** new coding concept. Later Lessons can be pure practice.
- Lesson 1 starts from a `Player.ts` stub with an empty `Update()`. The student writes one line that moves the box right.
- Difficulty rises in two ways: harder concepts, and less guidance. Early Explanations give almost the whole line and stubs are finished methods with a gap. Later Explanations only describe the goal and name the API, and stubs are empty classes.
- Coins Goal = "collect all coins", shown in the Goal checklist. No on-screen HUD.

**Debug.Log (new engine API, additive to [What game API does the student code against?](002-game-api.md))**: Unity's `Debug.Log`, `Debug.LogWarning`, `Debug.LogError` write to a **Console** panel under the editor. Identical lines collapse into one with a count (`coins: 3 ×120`), only the last 500 lines are kept, and each Run clears it. Runtime errors also show here, in red, with the Script name and line. Type errors stay as Monaco squiggles.

**Left out**: double jump, wall jump, dash, animation, sound, on-screen UI/HUD.
