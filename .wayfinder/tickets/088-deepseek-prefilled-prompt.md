---
title: Open DeepSeek with the Tutor prompt already in its composer
label: build
status: open
blocked_by: []
assignee:
---

## What

When a student presses **Ask DeepSeek**, open a new DeepSeek chat with the full Tutor prompt already in its text field and ready for the student to finish `My question:`. The student should not have to paste it. Do not send the prompt automatically; the student decides when to submit it.

## Context

Ticket 030 deliberately used copy-and-open because DeepSeek prefill was unverified then. DeepSeek's landing flow now uses a `q` URL parameter (see [a reproduction in DeepSeek's GitHub repository](https://github.com/deepseek-ai/DeepSeek-V3/issues/1693)), but the web chat does not document a stable prefill contract. Verify a no-autosend link in the real browser before relying on it. This ticket supersedes ticket 030's “no `?q=` prefill” choice only if the full prompt lands unsent in the composer.

## Design constraints

- Preserve the existing Tutor rules, Lesson/Goals/Hint/Script/Console context, and the blank `My question:` ending. Work in both Lessons and Sandbox.
- Keep the prompt complete and correctly URL-encoded. Do not silently truncate long code or Console text. A URL handoff exposes this context in the address bar/history and to DeepSeek on navigation; keep that behavior tied to the student's explicit button click.
- Handle a blocked popup, a sign-in redirect, an unsupported/changed DeepSeek prefill, and an oversized URL honestly. Keep a clear copy/manual-paste fallback with the full prompt, and never claim prefill succeeded when it did not.
- Keep the existing free-account guidance where needed. Do not add a DeepSeek API key, browser extension, cross-origin DOM access, or automatic submission.

## Done when

- In a signed-in browser, clicking **Ask DeepSeek** from a Lesson and from Sandbox opens DeepSeek with the exact full Tutor prompt visible in the composer, unsent, and ready for the student's question.
- Tests cover prompt handoff encoding, no autosend, long-prompt fallback, and popup/copy failure behavior. Existing Tutor prompt tests still pass.
- `npm run typecheck` and `npm test` pass. Verify the real DeepSeek handoff in a browser; if the site cannot reliably prefill, leave this ticket open with a `## Blocked` note and the observed behavior rather than shipping the old copy flow as complete.

## Blocked

2026-10-30: The linked DeepSeek report confirms that its landing page passes text with `q`, but its example also uses `autosend=1`; it does not establish that a `q` link leaves the full Tutor prompt unsent in the chat composer. I attempted a real Chromium check of a `q` URL. Chromium could not launch in this environment because `libnspr4.so` is missing, and no signed-in DeepSeek browser session is available. The required signed-in Lesson and Sandbox observations therefore remain unverified. Keep the current copy-and-open flow until those observations establish reliable prefill; then implement and test the fallback cases in this ticket.
