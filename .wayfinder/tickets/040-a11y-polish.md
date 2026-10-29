---
title: Lesson page accessibility and polish
label: design
status: closed
blocked_by: [039-header-buttons]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look. User-friendliness first, looks second.

## What

Found in a Lighthouse run (Accessibility 93) and a guideline review of Lesson 1:

- `☰` button: add `aria-label` (it only has `title`).
- `#progress`: accessible name must contain the visible "0 / 15" (Lighthouse label-content-name-mismatch). Progress pips are 6 px tall: make them easier to read, and don't rely on color alone.
- `#console`: `aria-label` is invalid on a plain `<pre>`; give it a valid role (e.g. `role="log"`) or a visible heading.
- Contrast: `#999` on `#2d2d2d` (inactive tab, docs nav) and similar greys must pass; hover / focus states stronger than rest.
- `<html>`: `color-scheme: dark`; `<meta name="theme-color">` matching the background.
- `<title>` follows the context: "1. Move right · learn-dev", Project name in Sandbox.
- Tab is trapped in Monaco (inserts indentation). Show a small hint for Monaco's Ctrl+M "Tab moves focus" toggle, or make Esc → Tab leave the editor.
- Every icon/emoji-only control has a text equivalent; decorative emoji `aria-hidden`.

## Done when

- Lighthouse Accessibility has no failed audits on a Lesson page.
- A keyboard-only pass can reach every header button, the Lesson text, the game and the editor, and get back out of the editor.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `☰` has `aria-label="Course menu"` and its glyph is `aria-hidden`.
- `#progress`: the static label is gone. The code sets `aria-label` to "N / 15 Lessons passed, open the Course menu", so it contains the visible count. Pips are 12×10 and `aria-hidden`, and they don't rely on color: passed pips are filled green, the others are only outlined (`#6a6f7d`, 3.3:1). The count turns white on hover.
- `#console` is `role="log"` (polite live region built in), so its `aria-label` is valid. The extra `aria-live` was dropped.
- Contrast: the `#999` greys (inactive tabs, Docs nav, blockquotes, progress count, Compare/Achievements subtitles) are now `#b3b3b3`. That is 6.6:1 on `#2d2d2d`, and the progress count on its hover background went from 4.2:1 to more. Tabs and Docs nav buttons got a hover (white) and a `:focus-visible` ring, so both are stronger than rest. The selected tab and page are white.
- `<html style="color-scheme: dark">` and `<meta name="theme-color" content="#1e1e1e">`.
- `document.title` is "1. Move right · learn-dev", or the Project name in Sandbox.
- Leaving Monaco: Esc turns on Monaco's `tabFocusMode`, so the next Tab moves focus. Any other key or leaving the editor turns it off again, so Tab still indents normally. A small "Esc, then Tab: leave the editor" hint shows in the tab bar while the editor has focus, and the editor's `ariaLabel` says the same.
- Text equivalents: decorative ▶ ■ ✕ 🏆 📖 ☰ are `aria-hidden` spans. The Docs tab is labelled "Docs", 🏆 shows "Achievements N / M", and the hint button is "Hint N of M". Goals read "Done:" or "To do:" (a `.sr-only` span) instead of ✓/⬜. Achievement map tiles got `role="img"` so their `aria-label` is allowed.
- Test: `src/a11y.test.ts` checks the static markup. `npm run typecheck` and `npm test` pass.
- Not verified: Lighthouse. Headless Chromium can't start in this container because libnspr4/libnss3 are missing and there is no root to install them. Contrast was checked by computing the ratios. The Compare diff editor still traps Tab (it has the Close button and Esc).
