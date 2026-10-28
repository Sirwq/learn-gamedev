---
title: What is the Lesson file format?
label: wayfinder:grilling
status: closed
blocked_by: [002, 003]
assignee: vivy
---

## Question

What is inside one Lesson: instructions text, starter code, locked vs editable code regions, Checks, hints, level layout? What file format (TS module, JSON, Markdown + front matter)?

Constraint from [What game API does the student code against?](002-game-api.md): a Lesson has an Explanation, may add new Script files with stubs (never edits existing ones), and provides Reference code per Script, unlocked when the Lesson is passed.

Constraint from [How does a Check work?](003-check.md): a Lesson defines one Level, 1 or more Goals (conditions on game state checked each frame) and optional Lose events, each with a plain-language message. The Level must make each Goal need the Lesson's Mechanic.

## Resolution

**One folder per Lesson**, typed TypeScript so the compiler catches authoring mistakes:

- `lessons/02-jump/lesson.ts` exports a typed `Lesson` object (Level, Goals, Lose events, which Scripts it adds).
- `explanation.md`: the Explanation, one Markdown page shown in a side panel, with code blocks and a "Differs from Unity C#" box.
- Real `.ts` files for each new Script's **starter stub**, and for the **Reference code**.
- `course.ts` lists the Lesson folders in order. Folder number prefixes (`01-`, `02-`) are only for sorting.

**Code**
- No locked regions. Every file can be edited in full.
- Reference code is the **full file** for each Script the Lesson touches, as it should look after that Lesson. "Load reference code" loads the snapshot from the latest Lesson the student has passed.

**Level**
- A list of boxes: `{ tag, x, y, w, h, color, script? }`. `script` names the student file that controls the box, so the player is just a box with `script: "Player"`.
- Optional `width`/`height` (default 960×540) and optional camera start `camera: { x, y, size }`.

**Goals and Lose events**: `{ message: string, test: (world) => boolean }`. `world` is a read-only view of the game objects, and `test` runs every frame in the game worker.

**Camera (new engine API, additive to [What game API does the student code against?](002-game-api.md))**: copies Unity. `Camera.main.transform.position` (a `Vector2`, the view center, in pixels) and `Camera.main.orthographicSize` (half of the view height; default 270, changing it zooms). The viewport on screen stays 960×540. **No auto-follow**: following the player is student code, so it can be its own later Lesson. Until then, Levels fit on one screen.

**Hints**: not in the format. They wait for the "Hints and help" topic.
