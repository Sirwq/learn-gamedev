---
title: Keep Run available and report code errors in the Console
label: build
status: closed
blocked_by: []
assignee:
---

## What

Let a student press **Run** even when the editor shows code errors. When the code cannot run, open the Console and show actionable errors with the Script name and location instead of silently disabling Run.

## Design constraints

- Use the current editor diagnostics and Run compilation path to report syntax and type errors. Do not start a broken game or clear the current code. Avoid duplicate or stale errors after edits.
- Keep the existing Run shortcut and visible button available while editing. During an active Run, Stop remains the available action.
- Explain which Script and line need attention; make the Console output accessible and translated where the message is app-owned. Preserve runtime error reporting.

## Done when

- With a syntax or type error, clicking Run or using its shortcut opens the Console with the relevant Script and line; fixing the error allows the next Run to start.
- Valid code still runs, and runtime errors still appear in the Console. Test both Lesson and Sandbox Scripts, including multiple files.
- Browser-check the button and Console behavior; `npm run typecheck` and `npm test` pass.

## Resolution

- Run stays available while editing. It checks current Monaco syntax and type diagnostics for every Script, then transpiles all Scripts before starting the worker. Errors open the Console with Script, line, column, and message; the game and code remain intact.
- Editing clears the reported code errors and guidance. A corrected Run starts normally; runtime errors keep their existing Console path.
- Added a regression test for multi-Script error output. `npm run typecheck`, `npm test`, and `npm run build` pass. Chromium checks covered Lesson syntax, type, and runtime errors, correction and rerun, plus Sandbox multi-Script errors and the Run shortcut.
