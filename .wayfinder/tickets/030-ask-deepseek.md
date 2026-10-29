---
title: Add the Ask DeepSeek button and Tutor prompt
label: build
status: open
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
