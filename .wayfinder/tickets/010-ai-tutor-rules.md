---
title: How does the Ask DeepSeek button help without giving answers?
label: wayfinder:grilling
status: open
blocked_by: [009]
assignee:
---

## Question

For the MVP the AI help is an **Ask DeepSeek** button: it copies a prompt to the clipboard and opens `chat.deepseek.com`, where the student pastes it into their own free account (chosen over a paid built-in tutor; see [Which LLM and proxy power the AI tutor?](009-ai-tutor-provider.md)). What does the copied prompt contain: tutor rules (hint ladder? no code over N lines? refuse "write it for me"), the current Script, the Lesson's Explanation and Goals, Console errors? Where does the button sit in the [app shell](006-app-shell.md), and how does the student know to paste? Does a `?q=` link prefill DeepSeek's chat, or is copy-then-open the only way? The rules must agree with the shared "Note for AI assistants" text from [What does the in-app API documentation contain?](007-api-docs.md).
