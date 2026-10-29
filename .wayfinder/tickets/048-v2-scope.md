---
title: What is in v2?
label: wayfinder:grilling
status: closed
blocked_by: []
assignee: claude
---

## Question

The MVP put a list of things off for later (Out of scope on the [MVP map](../map.md)). Which of them make v2, and which wait longer? Candidates: the [Level editor](049-level-editor.md), students' own sprites ([How do students bring their own sprites?](050-own-sprites.md)), a C# Course ([How does student C# run in the browser?](053-csharp-runtime.md)), sound and animation ([What do sound and animation add to the engine?](054-sound-animation.md)), the built-in paid AI tutor ([Which LLM and proxy power the AI tutor?](009-ai-tutor-provider.md) is already researched), an author's Lesson editor, accounts and server saves, a HUD, extra Mechanics (double jump, wall jump, dash), multiplayer. Also: is v2 for the same student (a total beginner who finished the Course), and does anything new stay secret like Sandbox mode, or show from the start?

## Resolution

**v2 is a Construct-like Sandbox for the same student, after the Course.**

- **Student**: the same total beginner, once the 15-Lesson Course is passed. The Course itself does not change.
- **After the Course**: everything new lives inside Sandbox mode, unlocked after the Course (Lesson 15) ([How does Sandbox mode work?](015-sandbox-mode.md)). It is what comes after the basic Course, not a secret: the Mechanic Achievements show and count from the start ([Which Achievements reward extra Mechanics?](056-mechanic-achievements.md)).
- **In v2**:
  - The Level editor ([How does the Level editor work?](049-level-editor.md)).
  - Students' own sprites ([How do students bring their own sprites?](050-own-sprites.md)), with storage to match ([Where do Projects with images live?](051-project-storage.md)).
  - Sound and animation ([What do sound and animation add to the engine?](054-sound-animation.md)).
  - On-screen UI text, Unity-style ([What on-screen UI text does the student write?](055-ui-text.md)).
  - Extra Mechanics (double jump, wall jump, dash) as new **Achievements** only: no Lessons and no new engine features. The student builds the move and the Achievement notices ([Which Achievements reward extra Mechanics?](056-mechanic-achievements.md)).
- **Left open**: whether the Level editor is also the authors' Lesson editor ([Is the Level editor also the authors' Lesson editor?](052-author-lesson-editor.md)).
- **Later, not v2**: a C# Course ([How does student C# run in the browser?](053-csharp-runtime.md), closed as out of scope), the built-in paid AI tutor (Ask DeepSeek stays), accounts and server saves (backup by export / import file instead), multiplayer.
