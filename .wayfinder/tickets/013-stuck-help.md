---
title: What non-AI help does a stuck student get?
label: wayfinder:grilling
status: closed
blocked_by: []
assignee: vivy
---

## Question

Today a stuck student has only the Ask DeepSeek button ([How does the Ask DeepSeek button help without giving answers?](010-ai-tutor-rules.md)), and Reference code unlocks only *after* a pass ([How does a Check work?](003-check.md)). Lessons unlock in order with no skipping, so a student who can't pass is stuck for good. What help lives in the app itself? Cover: written hints per Lesson (how many, how they open, whether they cost anything), whether the solution can be revealed before passing and what that does to the pass, and what the Lesson format needs for it ([What is the Lesson file format?](004-lesson-format.md) left hints out: "They wait for the Hints and help topic").

## Resolution

**Hints**
- Each Lesson has a ladder of up to 3 written hints: nudge → idea → almost the code (fill-in-the-blank). Fewer when the Lesson doesn't need 3.
- 💡 Hints sit at the bottom of the Explanation panel, below the "Differs from Unity C#" box. One click opens the next hint. There's no timer, no try-first lock, and no cost (no score, no mark on the pass, no effect on Achievements).
- Opened hints are saved per Lesson in localStorage, so they stay open after a reload or a replay.
- Hints are per Lesson, not per Goal.

**No solution before passing.** Nothing unlocks the Reference code early. After the last hint, a fixed **"Still stuck?"** box (the same in every Lesson, not authored) points to: the **Ask DeepSeek** button, **📖 Docs** (opens the Docs tab as it is, with no per-Lesson jump), and "Ask the person on your left, then the one on your right."

**Tutor prompt**: adds the hints the student has already opened, so DeepSeek doesn't repeat them (additive to [How does the Ask DeepSeek button help without giving answers?](010-ai-tutor-rules.md)).

**Lesson format** (additive to [What is the Lesson file format?](004-lesson-format.md)): one `hints.md` per Lesson folder, split by `## Hint 1`, `## Hint 2`, `## Hint 3` headings. Markdown, so hints can hold code blocks. The hint count isn't validated.
