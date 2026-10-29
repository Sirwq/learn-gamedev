---
title: Code editor without the minimap
label: design
status: closed
blocked_by: []
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look (`index.html` styles, Monaco `vs-dark`).

## What

- The code editor (`monaco.editor.create` in `src/main.ts`) shows Monaco's default minimap on the right. A beginner's Scripts are a screenful long, so it is clutter that takes width from the code and looks like a second scrollbar. Turn it off: `minimap: { enabled: false }`.
- Same for the Compare diff editor (`monaco.editor.createDiffEditor`), and check that the overview ruler there doesn't stand in for it as a second scrollbar.
- Same in Sandbox Projects, which use the same editor.

## Done when

- No minimap in the code editor or in Compare, in Lessons and in Sandbox.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `monaco.editor.create` in `src/main.ts` gets `minimap: { enabled: false }`. Sandbox Projects use the same editor instance, so the change covers them too.
- The Compare diff editor gets `minimap: { enabled: false }` and `renderOverviewRuler: false`, so the change markers no longer show up as a second scrollbar beside the real one.
- `src/a11y.test.ts` checks both options are in `main.ts`.
