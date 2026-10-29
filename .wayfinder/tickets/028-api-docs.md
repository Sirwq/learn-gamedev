---
title: Generate the 📖 Docs tab from the engine typings
label: build
status: open
blocked_by: [016-engine-core]
assignee:
---

## What

- A **📖 Docs** tab, always last after the Script tabs, not closable; the Console stays under it.
- One page per class (`MonoBehaviour`, `GameObject`, `Transform`, `Vector2`, `Input`, `KeyCode`, `Time`, `Camera`, `Debug`) plus a **TypeScript vs Unity C#** page.
- Each member: signature, one-line description, short example, and a "Differs from Unity C#" note where it differs.
- Generated from the doc comments on the engine typings, the same text Monaco shows on hover, so they can't drift.
- API names in an Explanation link to the Docs tab scrolled to that member.
- Include the shared "Note for AI assistants" text.

Classes that don't exist yet (e.g. `Camera` before ticket 024) just don't get a page; the generator picks up whatever the typings hold.

## Spec

- [007-api-docs.md](007-api-docs.md)

## Done when

- A test checks every exported engine member has a doc comment, and that the generated pages include it.
- `npm run typecheck` and `npm test` pass.
