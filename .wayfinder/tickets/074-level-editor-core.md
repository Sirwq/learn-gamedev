---
title: Level editor, part 1: the 🗺 Level tab, select, move, resize
label: build
status: open
blocked_by: [071-project-storage]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

The first usable slice of the Level editor, Sandbox only. Prototype: `prototypes/level-editor.prototype.html` on branch `prototype/level-editor` (read with `git show`, never merge; its look is rough).

- A **🗺 Level** file tab, first in the file tabs. With it open and the game stopped, the game view is the editor and the left column becomes the inspector. Run locks the editor; at Stop, `Instantiate`d boxes vanish and editor boxes go back where the editor had them.
- Select a box by clicking; drag to move; 8 handles to resize. The selected box shows tag, position and size; Scripts show as small labels on their boxes.
- **Inspector**: Tag and Script dropdowns (existing tags and Scripts), x, y, w, h number fields, Duplicate, Delete. Under it, a list of every object (tag, Script, position); clicking one selects it and brings it into view.
- **Snap** to the 20 px grid; tiled tags (Ground, Platform, Wall, Water, Spikes) snap size to 20, sprite tags resize in 4 px steps. Alt or a Snap button turns it off. Grid and world origin show while snapping.
- **Undo / redo** (Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z): one step per move, resize, delete or inspector change; kept across tab switches and Runs, lost on reload. Delete needs no confirmation.
- **View Level as Code**: a button opening a read-only dialog with the `level.boxes` list, plus a Copy button.
- The Level saves with the Project.
- [064-codebase-architecture.md](064-codebase-architecture.md) left the Lesson view / editor / Run driver in `main.ts` for this ticket to split as needed.

## Spec

- [049-level-editor.md](049-level-editor.md)
- [052-author-lesson-editor.md](052-author-lesson-editor.md): Copy on "View Level as Code"
- [004-lesson-format.md](004-lesson-format.md)

## Done when

- Tests for the pure parts: snapping (grid, tiled vs sprite steps, Alt), hit-testing boxes and handles, the undo stack, Level-as-code output matching the Lesson format.
- Edits are refused while running, and Stop restores editor boxes (test).
- `npm run typecheck` and `npm test` pass.

## Resolution
