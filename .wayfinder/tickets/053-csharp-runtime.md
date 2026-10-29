---
title: How does student C# run in the browser?
label: wayfinder:research
status: closed
blocked_by: [048]
assignee: claude
---

## Question

The Course menu already shows "C# — coming later". The TypeScript Course runs student code with Monaco type checks, a Sucrase transpile and a fresh Web Worker per Run ([How do we run student TypeScript safely in the browser?](001-run-student-ts.md)). What are the options for C#: compiling in the browser (Roslyn on WebAssembly / .NET in the browser), a C#-to-JavaScript compiler, or a server? Compare download size, compile time per Run, error messages a beginner can read, editor type checks, and stopping infinite loops. Can the same Unity-style API ([What game API does the student code against?](002-game-api.md)) and Lesson format serve both Courses?

## Resolution

**Out of scope for v2** ([What is in v2?](048-v2-scope.md)): a C# Course is a later effort (v3 or beyond). The question stands as written for when that map is charted.
