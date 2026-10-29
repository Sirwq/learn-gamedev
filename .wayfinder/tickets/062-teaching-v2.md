---
title: How do students learn the v2 parts?
label: wayfinder:grilling
status: closed
blocked_by: [048, 049, 050, 054, 055, 056, 060]
assignee: claude
---

## Question

Everything v2 adds lives in Sandbox mode after the Course ([What is in v2?](048-v2-scope.md)), and the Course itself doesn't change: the Level editor ([How does the Level editor work?](049-level-editor.md)), own sprites ([How do students bring their own sprites?](050-own-sprites.md)), `this.audio.PlayOneShot` and engine animation ([What do sound and animation add to the engine?](054-sound-animation.md)), `OnGUI` / `GUI.Label` ([What on-screen UI text does the student write?](055-ui-text.md)), the Mechanic Achievements ([Which Achievements reward extra Mechanics?](056-mechanic-achievements.md)) and sharing by Export file ([How do students share a Project?](060-share-project.md)). How does a total beginner fresh out of Lesson 15 find and learn them? Cover: whether the Course gains Lessons or Achievements for them, or Sandbox teaches by itself (📖 Docs pages, a starter Project, first-time tips, empty states); what the "🔓 Sandbox unlocked" moment shows; whether Achievements nudge students towards the new APIs; and how the Mechanic Achievements, which show from day one, explain themselves before Sandbox exists.

## Resolution

**A Chapter 2 of real Lessons for the v2 code and game feel; Sandbox teaches the rest with a Docs page and a tour Project.**

- **Chapter 2**: Lessons 16 onwards, built like Lessons 1–15 (Explanation, checked Goals, Hints, Reference code, pass screen, Compare). They teach `this.audio.PlayOneShot`, `OnGUI` / `GUI.Label` and game feel (for example variable jump height, coyote time, jump buffering, a little screen shake, sound on landing and hits). Which Lessons, and their Goals, is [Which Lessons make up Chapter 2?](063-chapter-2-lessons.md).
- **Lessons 1–15 don't change.** Chapter 1 stays silent and without screen text; sound and `GUI` work in Chapter 2 Lessons and in Sandbox. This amends "no new Lessons in v2" in [What is in v2?](048-v2-scope.md) and "Sandbox only" in [What do sound and animation add to the engine?](054-sound-animation.md) and [What on-screen UI text does the student write?](055-ui-text.md).
- **Unlock**: Chapter 2 and Sandbox both open when Lesson 15 is passed; neither waits for the other, and Chapter 2 is optional. The toast says "🔓 Sandbox and Chapter 2 unlocked" and the menu still slides to Sandbox. The empty Sandbox menu shows one line beside "+ New": "New here? Try Example: Sandbox tour, or carry on with Chapter 2 in the Course." No dialog.
- **Course menu**: Chapter 2 continues the same Lesson path after Lesson 15 with a small "Chapter 2" label, hidden until Lesson 15 is passed. `✓ n / 15` stays Chapter 1 (the Course is finished at 15); after unlock a second stat shows: `✓ n / 15 · Ch. 2 n / m`. 💾 Saves and Import everything treat Chapter 2 Lessons like any other Lesson.
- **Not Lessons**: the Level editor, own sprites and sharing are clicking, not code, and Lesson Levels stay fixed. They are taught by:
  - a hand-written **Sandbox** page in 📖 Docs, shown after unlock: a few sentences each on the Level editor, own sprites (with Piskel / Aseprite), sound (the ten clip names), screen text (`OnGUI`, y-down) and sharing / backups, each linking its class page;
  - **Example: Sandbox tour**, a third "+ New" choice next to Blank and My platformer: a small Level made in the Level editor, a Player Script that plays `Jump` and `Coin`, a `HUD.ts` coin counter with `GUI.Label`, one own-sprite slot left empty with a comment saying where to set it, short plain comments. An ordinary Project to read, Run, change or delete. No tutorial popups or coach marks.
- **No new Achievements** for using the new APIs; the count stays `n / 21`.
- **Mechanic Achievements stay Achievements only**: Chapter 2 doesn't teach Double jump, Wall jump or Dash. Their tile detail adds one line: "Extra: no Lesson teaches this. Build it in your own Player code, in any Lesson or a Sandbox Project." No Hints, no Docs walkthrough.
