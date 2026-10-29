---
title: Add the Ask DeepSeek button and Tutor prompt
label: build
status: closed
blocked_by: [018-checks, 019-console, 029-hints]
assignee:
---

## What

- **Ask DeepSeek** in the top bar, right of Run.
- Click → copy the Tutor prompt to the clipboard → open plain `https://chat.deepseek.com` in a new tab → toast: "Prompt copied. In DeepSeek: Ctrl/Cmd+V, type your question at the end, Enter." First click ever also shows "You need a free DeepSeek account." If copying fails, a pop-up shows the prompt with Select all.
- Tutor prompt, in order: tutor rules, Lesson title, Explanation, Goals with ⬜/✓, opened Hints, the open Script (or last edited), last ~20 Console lines, then `My question:`.
- Tutor rules grow out of the shared "Note for AI assistants" text and live in one source.
- No `?q=` prefill.

## Spec

- [010-ai-tutor-rules.md](010-ai-tutor-rules.md)
- [013-stuck-help.md](013-stuck-help.md): opened hints in the prompt

## Done when

- A test builds the Tutor prompt from a fake state and checks the order of sections and the trailing `My question:`.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `tutorRules` and `tutorPrompt()` live in `src/lessons/ai-note.ts`, next to the shared note. The rules start with `aiNote`, so there is one source.
- The prompt has these sections, in order: rules, `# Lesson`, Explanation, Goals (⬜/✓ from the last Check), opened Hints (left out if there are none), the open Script (`show()` records it, so Docs or Compare still give the last one shown), the last 20 Console lines, `My question: `.
- **Ask DeepSeek** sits in the top bar after Run and Stop. It copies the prompt first and then opens `https://chat.deepseek.com`, because a new tab that takes focus would make the clipboard write fail. Then it shows the toast. The first click ever also shows the account toast (localStorage key `asked-deepseek`).
- If copying fails, a `<dialog>` shows the prompt with Select all and a DeepSeek link, and no tab opens.
- Tests: `src/lessons/ai-note.test.ts` checks the section order, the trailing `My question:`, the 20-line Console limit, and that the rules start with the note.
- Not checked in a real browser.
