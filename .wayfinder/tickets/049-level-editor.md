---
title: How does the Level editor work?
label: wayfinder:prototype
status: open
blocked_by: [048]
assignee:
---

## Question

Today a Level is a list of boxes `{ tag, x, y, w, h, color, script? }` written in code ([What is the Lesson file format?](004-lesson-format.md)), and a Sandbox Project builds its world with `Instantiate` ([How does Sandbox mode work?](015-sandbox-mode.md)). Prototype a Level editor where boxes are placed, moved and resized with the mouse. Cover: where it opens (a tab next to the code in a Project? its own screen?), how a box gets its tag and Script, whether boxes snap to the 20 px tile grid the art uses, how the student pans across a Level wider than the screen, undo, how editing and Run take turns (edit only while stopped?), and how editor boxes and boxes spawned by code live together. Does it work with keyboard and touch as well as the mouse, like the Course menu ([What does the Course menu look like?](012-course-menu.md))?
