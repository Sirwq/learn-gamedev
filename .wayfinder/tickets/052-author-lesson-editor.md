---
title: Is the Level editor also the authors' Lesson editor?
label: wayfinder:grilling
status: closed
blocked_by: [049]
assignee: claude
---

## Question

A Lesson editor for authors is Out of scope on the [MVP map](../map.md): Lessons are folders of `lesson.ts`, Markdown and `.ts` files ([What is the Lesson file format?](004-lesson-format.md)). Once a Level editor exists ([How does the Level editor work?](049-level-editor.md)), should authors use it to lay out Lesson Levels, and does it save back to `lesson.ts`? Or is it student-only? What about Goals, Lose events, Hints and Reference code: do they stay as code and Markdown?

## Resolution

Grilled with the user; all recommendations accepted.

- **Authors are developers.** For now "author" means the developer writing the TypeScript Course in the repo. v2 does not plan for authors who don't code (teachers, contributors).
- **The Level editor is student-only.** There's no author mode, no opening a Lesson's Level in the editor and no saving back to `lesson.ts`. Authors keep writing `level.boxes` by hand: Lesson Levels have 3 to 9 boxes each, and rewriting a TypeScript file from the browser would lose comments, spreads like `...start` and the formatting.
- **Copy bridge.** The read-only "View Level as Code" dialog ([How does the Level editor work?](049-level-editor.md)) gets a **Copy** button. An author can lay out a Level in a Sandbox Project and paste the boxes into `lesson.ts`, fixing by hand any tags or own sprites that exist only in Sandbox. Students get the same button.
- **Everything else stays code and Markdown**, with no editor UI: Goals and Lose events (`test(world)` in `lesson.ts`), Hints (`hints.md`), the Explanation, and the starter stubs and Reference code (`.ts` files).
- **No "Remix this Level"** in v2: a student can't copy a Lesson's Level into a new Sandbox Project. New Projects start as [How does Sandbox mode work?](015-sandbox-mode.md) decided.
