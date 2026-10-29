---
title: What does the in-app API documentation contain?
label: wayfinder:grilling
status: closed
blocked_by: [002]
assignee: vivy
---

## Question

The engine needs reference docs that work without Lessons, so it can also be used on its own. Which pages exist (one per class: `MonoBehaviour`, `Transform`, `Vector2`, `Input`, `KeyCode`, `Time`, `GameObject`, `Camera`)? What does each page show (signature, example, "differs from Unity C#" note)? Where does it open in the app? Are pages always visible, or unlocked as Lessons introduce them? Does it explain the known TypeScript vs C# differences (`this.`, `Add`/`Scale` instead of operators)?

Constraint from [What is the first Course?](005-first-course.md): add a `Debug` page (`Log`, `LogWarning`, `LogError`).

## Resolution

**Pages**: one per class (`MonoBehaviour`, `GameObject` with `Instantiate` / `Destroy` / `FindGameObjectsWithTag`, `Transform`, `Vector2`, `Input`, `KeyCode`, `Time`, `Camera`, `Debug`) plus one **TypeScript vs Unity C#** page listing every known difference.

**Each member**: signature, one-line description, short example, and a "Differs from Unity C#" note where it differs (`this.`, `Add` / `Scale` instead of operators, read-only `position`, fixed `Time.deltaTime`). No links to Unity's C# docs.

**Where**: a **📖 Docs** tab, always last after the Script tabs, not closable. The Console stays under it. API names in a Lesson's Explanation link to the Docs tab, scrolled to that member.

**Visibility**: every page is visible from the start. Only Lessons unlock (each Lesson by passing the previous one). The docs also serve Sandbox mode.

**Source**: generated from the comments on the engine's type definitions, the same source as the Monaco hover (signature + one line). Docs and hover can't drift apart.

**Note for AI assistants**: one shared, visible text in every Explanation, the docs and the Ask DeepSeek Tutor prompt. Not in Script stubs (ticket 038): it was the first thing a beginner read and wasn't for them; code copied into an AI by hand no longer carries it. It asks an AI to tutor (explain, hint, point at the wrong line) and never write the Mechanic's solution. It isn't hidden: hidden prompts are easy to get around and feel sneaky.

**Surfaced**: a built-in AI tutor (cloud Chinese model via a small proxy) and an achievement map, each now its own ticket.
