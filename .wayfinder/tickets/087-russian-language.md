---
title: Add Russian as a complete learning language
label: build
status: open
blocked_by: [086-translation-layer]
assignee:
---

## What

Let a student use the Course and Sandbox in Russian. Add a real Russian catalog and localized learning content through the translation layer from ticket 086, plus an English / Русский language choice in the app. A student can switch languages and continue the same saved work.

## Design constraints

- Translate the app shell, Course and Sandbox menus, editor and Level controls, Objects view, dialogs, toasts, Goal and Lose messages, errors, accessible names, and backup/share guidance. Use natural Russian plural forms for counts.
- Translate all 21 Lesson display titles, concepts, Explanations, Hints, and learner-facing Docs prose. Include the Sandbox tour's instructional comments and the tutor prompt text. Preserve code snippets, Script and class names, tags, clip names, shortcuts, links, and Unity/TypeScript terminology where translation would make code harder to follow.
- Keep the Course order, Level data, checks, and Reference code unchanged. A translated display title must never become a progress, snapshot, Project, backup, or URL key. Existing English saved work must open in Russian and still open after switching back.
- The language choice is available before starting a Lesson and while in a Lesson or Sandbox Project. Save the choice; use the browser's Russian preference only when no choice is saved. Set the page language and keep focus and the current view stable when switching.
- Missing Russian content falls back to English without showing a raw translation key. Do not ship placeholder or machine-written text without review for meaning and readability.

## Done when

- A new student can choose Русский and complete a Lesson, browse Docs, inspect Objects, and use a Sandbox Project with the interface and learning text in Russian.
- A returning student can switch English → Russian → English without losing Lesson progress, code, hints, Achievements, Projects, or backups.
- Tests cover locale selection and persistence, Russian plural forms, content coverage and fallback, stable save keys, and unchanged Lesson checks. `npm run typecheck` and `npm test` pass.
- Browser-check a first Lesson, a Chapter 2 Lesson, Docs, the Course menu, and Sandbox in both languages, including keyboard and screen-reader labels.
