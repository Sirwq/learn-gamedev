---
title: How does the AI tutor help without giving answers?
label: wayfinder:grilling
status: open
blocked_by: [009]
assignee:
---

## Question

The tutor gives a little help, never the solution (like cs50.ai). What is its system prompt and rules (hint ladder? no code over N lines? refuse "write it for me")? What does it see: the current Script, the Lesson's Explanation and Goals, Console errors? Where does it sit in the [app shell](006-app-shell.md), and how often can a student ask (free-tier limits from [Which LLM and proxy power the AI tutor?](009-ai-tutor-provider.md))? Its rules must agree with the shared "Note for AI assistants" text from [What does the in-app API documentation contain?](007-api-docs.md).

Constraint from [Which LLM and proxy power the AI tutor?](009-ai-tutor-provider.md): the proxy accepts only `{lessonId, code, question}` and builds the prompt server-side, so the system prompt lives in the proxy. Limits are per browser ID, per IP and a global daily budget. The model (DeepSeek V4.1 Flash) still needs a hand-graded check on ~20 real student mistakes.
