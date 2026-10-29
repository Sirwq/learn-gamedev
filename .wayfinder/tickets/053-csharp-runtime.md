---
title: How does student C# run in the browser?
label: wayfinder:research
status: open
blocked_by: [048]
assignee:
---

## Question

The Course menu already shows "C# — coming later". The TypeScript Course runs student code with Monaco type checks, a Sucrase transpile and a fresh Web Worker per Run ([How do we run student TypeScript safely in the browser?](001-run-student-ts.md)). What are the options for C#: compiling in the browser (Roslyn on WebAssembly / .NET in the browser), a C#-to-JavaScript compiler, or a server? Compare download size, compile time per Run, error messages a beginner can read, editor type checks, and stopping infinite loops. Can the same Unity-style API ([What game API does the student code against?](002-game-api.md)) and Lesson format serve both Courses?
