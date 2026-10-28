---
title: What game API does the student code against?
label: wayfinder:grilling
status: closed
blocked_by: []
assignee: vivy
---

## Question

What does the student see and call? Names and shape of the Unity-like API: `update(dt)` / `start()`, `player.position`, velocity, `Input.getKey(...)`, spawning things (bullets), collisions. What stays hidden inside the engine? How does the API grow Lesson by Lesson without breaking earlier code?

## Resolution

The API copies Unity exactly, with Unity names and PascalCase, so moving to Unity C# later is easy. Known differences from C# are fine and get explained in each Lesson's Explanation.

**Student code shape**
- One file per script, like Unity: `Player.ts`, then `Bullet.ts`, `Enemy.ts`, shown as editor tabs.
- A script is a class: `class Player extends MonoBehaviour { Start() {} Update() {} }`.
- TypeScript needs `this.` (`this.transform`, `this.speed`). That difference is accepted.

**Engine surface (MVP)**
- `this.transform.position` is a `Vector2`. Pixels, origin at the bottom-left, y goes up; the engine flips it when drawing.
- `Vector2` acts like a C# value type. `position` is read-only, so `position.x += 5` is a type error. The student assigns `this.transform.position = new Vector2(x, y)`.
- TypeScript has no operator overloading, so vector maths is `a.Add(b)` and `a.Scale(n)`.
- `Time.deltaTime` is always 1/60 (a fixed step), so results are the same every run and Checks are reliable.
- Input: `Input.GetKey(KeyCode.X)` (held), `Input.GetKeyDown(KeyCode.X)` (pressed this frame), `Input.GetKeyUp(...)`. Keys: arrows, WASD, Space.
- Objects: `Instantiate(...)`, `Destroy(obj)`, `GameObject.FindGameObjectsWithTag("Enemy")`. Objects are axis-aligned boxes (position + size).
- The engine only draws, reads input, keeps time, and creates or removes objects. **No built-in physics or collision**: movement, gravity, jump velocity and overlap checks are what the student writes in each Lesson.

**Growth across Lessons**
- The student's own code carries over from Lesson to Lesson.
- A new Lesson may add a new script file with a stub. It never edits the student's existing files.
- Each file gets a **Load reference code** button. It appears only after the student passes the Lesson that file belongs to, and it replaces only that file.
- The API only ever adds things and never renames them.

**Also decided**
- "Chapter" means Lesson; there is no separate grouping level.
- Separate API documentation is in the MVP, because the engine should also work on its own, without Lessons. It is now its own ticket.
