---
title: What is the Lesson file format?
label: wayfinder:grilling
status: open
blocked_by: [002, 003]
assignee:
---

## Question

What is inside one Lesson: instructions text, starter code, locked vs editable code regions, Checks, hints, level layout? What file format (TS module, JSON, Markdown + front matter)?

Constraint from [What game API does the student code against?](002-game-api.md): a Lesson has an Explanation, may add new Script files with stubs (never edits existing ones), and provides Reference code per Script, unlocked when the Lesson is passed.

Constraint from [How does a Check work?](003-check.md): a Lesson defines one Level, 1 or more Goals (conditions on game state checked each frame) and optional Lose events, each with a plain-language message. The Level must make each Goal need the Lesson's Mechanic.
