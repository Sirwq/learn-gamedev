---
title: Generate the 📖 Docs tab from the engine typings
label: build
status: closed
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

## Resolution

- `src/engine-api.d.ts`: every doc comment now has a one-line text, an `@example`, and a `@unity` tag where it differs from Unity C#. Monaco shows these tags on hover, so hover and Docs share one source.
- `src/docs.ts`: a small line parser turns the typings into one Markdown page per class/enum. `Instantiate`, `Destroy` and `Prefab` go on the GameObject page. A last **TypeScript vs Unity C#** page lists every `@unity` note with links. Every page ends with the shared `aiNote`. `docLink` maps an inline code name in an Explanation (`Update()`, `Time.deltaTime`, `GetKeyDown`) to a member; ambiguous names like `transform` are not linked.
- `src/main.ts` / `index.html`: the **📖 Docs** tab is always last and can't be closed. It swaps with the editor in the same grid cell, so the Console stays under it. It has a page list on the left. Any `#doc-…` link opens the page and scrolls to the member.
- Tests (`src/docs.test.ts`): the TypeScript parser walks the typings on its own and checks each declaration and member has a doc comment, plus an anchor and its text on a generated page. Also tests page list, AI note, C# page links and Explanation link lookup.
- No browser check was run (no browser in the sandbox).
