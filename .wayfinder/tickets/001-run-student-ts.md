---
title: How do we run student TypeScript safely in the browser?
label: wayfinder:research
status: closed
blocked_by: []
assignee:
---

## Question

How do we turn the student's TypeScript into running code and run it safely each frame? Compare transpilers (Monaco's built-in TS worker, the `typescript` package, sucrase/esbuild-wasm) and sandboxes (iframe vs Web Worker vs same-thread). Cover: download size, speed, stopping infinite loops, mapping runtime errors back to editor lines, and how the sandbox talks to the Canvas game loop.

## Resolution

- Type errors: reuse Monaco's built-in TS worker diagnostics (already loaded); block Run while Error markers exist.
- Transpile with Sucrase (~48 KB gzip, sub-ms, keeps line numbers, so no source maps). Note `typescript@7` on npm is native Go with no browser compiler.
- Run each attempt in a fresh module Web Worker that owns the game loop, OffscreenCanvas 2D drawing, student code (Blob URL `import()`) and Checks. The main thread forwards keys and runs a heartbeat watchdog that calls `terminate()` on infinite loops.
- Runtime errors: `try/catch` around `update(dt)`, read `blob:...:LINE` from the stack, and show a Monaco marker on that line.

Details and sources: [research/run-student-ts.md](../research/run-student-ts.md)
