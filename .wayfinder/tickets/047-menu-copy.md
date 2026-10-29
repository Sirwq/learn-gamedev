---
title: Course menu: copy and labels
label: design
status: closed
blocked_by: [046-menu-small-screens]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark look of the Course menu. User-friendliness first, looks second. Out of scope: the cover art on the cards and the blurred background (the user has its own plan for those).

## What

- `C# · soon` is a disabled button whose only explanation is a `title` tooltip. Disabled buttons can't be hovered or focused on most setups, so make it plain text ("C# — coming later") or a focusable chip that shows the existing toast.
- Q / E while the Sandbox is locked toast "TypeScript is the only Course for now. C# comes later." That's wrong for E, which goes to Sandbox. Make E say "Sandbox opens when you finish the Course".
- `Esc Back to Lesson` on the very first launch, before the student has seen any Lesson: label it with where it goes ("Back to Lesson 1"). Or, on first launch, drop it, since Play does the same thing.
- Play button states (`Play` / `Replay` / `Locked`): a disabled-looking **Locked** primary button reads as broken. Keep it enabled. Pressing it explains what to do ("Pass Lesson 1 to unlock"), and show that same text under the title as it is now.
- Use the same word for the same thing everywhere: "Lesson" on cards, in the bars and in toasts. Never "level" for a Lesson (user decision in 041).

## Done when

- Every control on the menu says what happens when you use it, with no tooltip needed.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `C# · soon` (a disabled button with a tooltip) is now plain muted text "C# — coming later" after the tab keys.
- E while the Sandbox is locked toasts "Sandbox opens when you finish the Course"; Q keeps the C# message.
- Esc names where it goes: "Back to Lesson N" (the Lesson behind the menu, so "Back to Lesson 1" on first launch), "Back to Project" in a Project.
- Play on a locked Lesson stays enabled and reads "How to unlock"; pressing it toasts "Pass Lesson N to unlock", the same words as the line under the title.
- Checked user-facing copy: "Level" only means the game layout (GLOSSARY), never a Lesson.
- Test: `src/a11y.test.ts` "says what every menu control does without a tooltip".
