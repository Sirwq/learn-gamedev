---
title: How does the Level editor work?
label: wayfinder:prototype
status: closed
blocked_by: [048]
assignee: claude
---

## Question

Today a Level is a list of boxes `{ tag, x, y, w, h, color, script? }` written in code ([What is the Lesson file format?](004-lesson-format.md)), and a Sandbox Project builds its world with `Instantiate` ([How does Sandbox mode work?](015-sandbox-mode.md)). Prototype a Level editor where boxes are placed, moved and resized with the mouse. Cover: where it opens (a tab next to the code in a Project? its own screen?), how a box gets its tag and Script, whether boxes snap to the 20 px tile grid the art uses, how the student pans across a Level wider than the screen, undo, how editing and Run take turns (edit only while stopped?), and how editor boxes and boxes spawned by code live together. Does it work with keyboard and touch as well as the mouse, like the Course menu ([What does the Course menu look like?](012-course-menu.md))?

## Resolution

Prototype: [level-editor.prototype.html](../../prototypes/level-editor.prototype.html) on the throwaway branch `prototype/level-editor` (never merged). Round 1 had too many scroll areas and the Level code always open; round 2 fixed both and is the answer. Its look is rough; the real screen follows the map's UI design note (Vercel's Web Interface Guidelines and the frontend-design skill).

- **Sandbox only.** Lesson Levels stay fixed; the student never edits them.
- **Where**: a **🗺 Level** file tab, first in the editor's file tabs next to the Scripts. With it open and the game stopped, the game view is the editor, and the left column becomes the inspector.
- **Inspector**: the selected box's Tag and Script as dropdowns, with "+ New tag…" and "+ New Script…" at the bottom (a new Script gets a `Start()` / `Update()` stub and its own file tab). A tag with no sprite draws as a plain box in a colour picked there. Then x, y, w, h as number fields, Duplicate and Delete. Under it, a list of every object in the Level (tag, Script, position); clicking one selects it and brings it into view.
- **Level as code**: a "View Level as Code" button opens a read-only dialog with the `level.boxes` list the editor saves, the same format as a Lesson's ([What is the Lesson file format?](004-lesson-format.md)). Not a panel that is always open.
- **Adding boxes**: a palette of tags with their sprites above the view. Drag one in, or click it (or press Enter on it) to drop it in the middle of the view. Player and Enemy come with their Script set.
- **Editing**: drag a box to move it, drag its 8 handles to resize. The selected box shows its tag, position and size next to it, and Scripts show as small labels on their boxes.
- **Snap**: positions snap to the 20 px tile grid; tiled tags (Ground, Platform, Wall, Water, Spikes) snap their size to 20 too, sprite tags resize in 4 px steps. Hold Alt, or turn the Snap button off, to place freely. The grid and the world origin show while snapping.
- **Moving around**: drag empty sky or use the wheel to pan; Ctrl+wheel or − / + zoom from 25 % to 200 %; Fit Level; a minimap strip of the whole Level under the view (click or drag to jump).
- **Keyboard**: arrows move the selected box by 20 (Alt: by 1), Shift+arrows resize it; with nothing selected, arrows pan. Del deletes, Ctrl+D duplicates, Esc deselects, Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z) undo and redo. The object list and palette work with Tab and Enter.
- **Touch**: built on pointer events, so tap and drag work, with 44 px targets on touch screens. No pinch-zoom or tablet layout beyond stacking the columns.
- **Undo**: one step per move, resize, add, delete or inspector change. Kept while switching tabs and running, lost on page reload. Delete needs no confirmation because it can be undone.
- **Edit vs Run**: editing only while stopped. Run locks the editor; boxes made by code (`Instantiate`) exist only while running and vanish at Stop, and every editor box goes back to where the editor had it.
- **Camera start**: the Level keeps its `camera: { x, y, size }` start; a "Set camera start here" button saves the current editor view as it. Student code can still move `Camera.main`.
- **Saving**: the Level is part of the Project and saves with it.
