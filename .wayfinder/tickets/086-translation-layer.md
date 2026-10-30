---
title: Add a translation layer for the learning app
label: build
status: open
blocked_by: []
assignee:
---

## What

Make the app ready for more languages while keeping English as the current visible language. Put student-facing interface text in an English catalog behind a typed translation interface, with placeholders and plural forms for dynamic messages. A future language should be addable by supplying a catalog and localized learning content, without changing navigation, Run logic, or saved work.

## Design constraints

- Cover the app shell, Course and Sandbox menus, editor and Level controls, Objects view, Docs navigation, dialogs, toasts, status and error messages, and accessible names. Keep code identifiers, Script names, tags, sound names, and keyboard shortcuts untranslated.
- Provide a clear content seam for Lesson titles, concepts, explanations, hints, and Docs prose. English content remains the fallback when a localized entry is missing. Keep Markdown links and code samples valid.
- Keep saved progress, snapshots, Projects, backups, and URL routing tied to stable canonical Lesson identity, never a translated display title. Existing English-keyed saves must continue to load without migration loss.
- Set the document language from the active locale. Resolve a saved locale or browser preference safely; if no supported translation exists, show English. Add a visible language picker only when a second real language ships.
- Avoid a large dependency for simple catalog lookup. Do not add placeholder machine translations to the product.

## Done when

- A contributor can add a locale by adding translation data and localized learning content, without editing each screen's logic. English still renders as it does now.
- Tests use a small alternate-locale fixture to prove catalog lookup, placeholders, plural forms, content fallback, document language, and unchanged saved progress/Project keys.
- No student-visible raw translation keys appear when a message is missing. `npm run typecheck` and `npm test` pass; browser-check English in a Lesson and a Sandbox Project.
