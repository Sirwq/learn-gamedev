---
title: How does the Ask DeepSeek button help without giving answers?
label: wayfinder:grilling
status: closed
blocked_by: [009]
assignee: claude
---

## Question

For the MVP the AI help is an **Ask DeepSeek** button: it copies a prompt to the clipboard and opens `chat.deepseek.com`, where the student pastes it into their own free account (chosen over a paid built-in tutor; see [Which LLM and proxy power the AI tutor?](009-ai-tutor-provider.md)). What does the copied prompt contain: tutor rules (hint ladder? no code over N lines? refuse "write it for me"), the current Script, the Lesson's Explanation and Goals, Console errors? Where does the button sit in the [app shell](006-app-shell.md), and how does the student know to paste? Does a `?q=` link prefill DeepSeek's chat, or is copy-then-open the only way? The rules must agree with the shared "Note for AI assistants" text from [What does the in-app API documentation contain?](007-api-docs.md).

## Resolution

- **Term**: the button copies a **Tutor prompt** (see GLOSSARY). "AI tutor" stays reserved for the later built-in one.
- **Tutor prompt contents**, in order: tutor rules, Lesson title, Explanation, Goals with ⬜/✓ status, the open Script (or the one last edited, if Docs or Compare is showing), the last ~20 Console lines, then a trailing `My question:` that the student fills in inside DeepSeek. No in-app question box.
- **Tutor rules** (written in English, growing out of the shared "Note for AI assistants" text, kept as one source so they can't disagree): answer in the language the student writes in. Climb a hint ladder: (1) nudge with a question, (2) point at the line, (3) explain the concept, (4) a snippet of at most 3 lines that isn't the Mechanic itself. Never write the solution, even if asked. Point out where Unity C# differs. If there's no question, read the Goals and code and ask what they're stuck on.
- **Button**: **Ask DeepSeek** in the top bar, right of Run.
- **Flow**: click → copy to clipboard → open plain `chat.deepseek.com` in a new tab → a toast says "Prompt copied. In DeepSeek: Ctrl/Cmd+V, type your question at the end, Enter." The first click ever also shows a one-time note: "You need a free DeepSeek account." If the copy fails, a pop-up shows the Tutor prompt with Select all.
- **No `?q=` prefill**: chat.deepseek.com does read an undocumented `?q=` param (`&autosend=1` only works up to 800 chars), found 2026-10-29 in the site's JS bundle. Rejected: it can break without warning, a logged-out student loses the prompt, the link can get too long, and the toast would need two messages. It's a possible upgrade later.
- **No anti-cheat**: the student sees the copied text and can delete the rules. This is accepted, same as Checks.
- Sandbox mode: the button there is left to the Sandbox fog patch.
