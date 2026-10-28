# How do we run student TypeScript safely in the browser?

Researched 2026-10-29. Ticket: [001](../tickets/001-run-student-ts.md).

## TL;DR

- **Type errors:** Monaco's built-in TS worker already type-checks and draws red squiggles. Reuse it (0 extra bytes). Block "Run" while the model has Error markers.
- **Transpile:** **Sucrase** (~48 KB gzip). It strips types and **keeps every line on the same line number**, so no source maps are needed.
- **Sandbox:** One **module Web Worker per Run**. The whole game (loop, student `update`, Canvas drawing, Checks) lives in the worker on an **OffscreenCanvas**. The main thread only runs Monaco and forwards key presses.
- **Infinite loops:** Watchdog on the main thread. The worker sends a heartbeat each frame. No heartbeat for ~1 s → `worker.terminate()` and show "Your code got stuck, check your loops". Add line-level loop guards later.
- **Error lines:** Load the student JS from a Blob URL with `import()`. Stack traces then point at `blob:...:LINE:COL`, and since Sucrase keeps lines, LINE is the editor line.

## 1. Transpilers

Measured on 2026-10-29 from the npm registry / jsDelivr (gzip via `gzip -c | wc -c`).

| Option | Extra download (gzip) | Speed (tiny snippet, Node, measured) | Type errors | Keeps line numbers |
|---|---|---|---|---|
| Monaco TS worker `getEmitOutput` | **0** (already loaded; min `ts.worker.js` ≈ 1.46 MB gzip, bundles TS 5.9) | async round trip to worker | Yes: `getSyntacticDiagnostics` / `getSemanticDiagnostics` | **No** (needs `sourceMap` + a decoder) |
| `typescript@5.9` npm in browser | ≈ 1.65 MB (`lib/typescript.js` 9.1 MB raw) | ≈ 0.36 ms/`transpileModule` | Yes (full program) or none (`transpileModule`) | **No** |
| `sucrase@3.35.1` | ≈ 48 KB (esm.sh bundle, 207 KB raw) | ≈ 0.04 ms/transform | **No** | **Yes** |
| `esbuild-wasm@0.28.2` | ≈ 3.8 MB `.wasm` + 15 KB JS | fast, but async + init | **No** | **No** (drops comments/blank lines) |

Facts and sources:

- Monaco's TS worker exposes `getEmitOutput(fileName, emitOnlyDtsFiles?, forceDtsEmit?)` and the diagnostic methods. Reach it via `typescript.getTypeScriptWorker()` (`monaco-editor@0.57.0/monaco.d.ts` lines ~10149, 10166; impl in `esm/vs/languages/features/typescript/tsWorker.js`). The bundled compiler is TS 5.9 (`versionMajorMinor = "5.9"` in `lib/typescriptServices.js`).
- **Breaking change to know:** since Monaco 0.55.0, `monaco.languages.typescript` moved to the top-level `typescript` namespace ([CHANGELOG](https://github.com/microsoft/monaco-editor/blob/main/CHANGELOG.md)). Old tutorials will be wrong.
- **`typescript` on npm is now 7.x (native Go).** `typescript@7.0.2` ships platform binaries (`@typescript/typescript-linux-x64`, ...) and an `unstable/*` client API, with no `lib/typescript.js` (registry metadata + jsDelivr file list). To run TS's JS compiler in a browser you must pin `typescript@5.9` / `6.0.x`. Monaco already does this for us.
- TS emit does **not** keep lines. Test: an 8-line file whose `throw` was on line 8 came out with the `throw` on line 5 (`ts.transpileModule`, TS 5.9, `target: ESNext`).
- Sucrase "does not type-check" and strips types file by file ([README](https://github.com/alangpierce/sucrase)). Its source map generator is "each line maps directly to the original line" ([`src/computeSourceMap.ts`](https://github.com/alangpierce/sucrase/blob/main/src/computeSourceMap.ts)). Confirmed by test: the output had the same line count with `throw` still on line 8. API: `transform(code, {transforms: ["typescript"]}).code`. Caveat: decorators/private fields pass through untransformed (fine for modern browsers).
- esbuild in the browser needs `esbuild-wasm` and `await initialize({ wasmURL })`, and has no sync API ([esbuild docs, Browser](https://esbuild.github.io/api/#browser)). It's too heavy for this job.

**Pick:** Monaco markers for type errors + Sucrase to run. Monaco markers are already on the model, so `editor.getModelMarkers({ resource: model.uri })` filtered to Error severity is enough to gate "Run".

## 2. Sandboxes

| | Same thread (`new Function`) | Web Worker | Sandboxed iframe (`sandbox="allow-scripts"`) |
|---|---|---|---|
| Infinite loop | **Freezes the whole tab**, Monaco included. Only a loop guard helps | Main thread stays alive; `terminate()` kills it | Same-process iframes share the main thread in most cases, so a loop can still freeze the page |
| Access to app | Full (DOM, localStorage, app state) | No DOM, no `localStorage`; can still `fetch` / IndexedDB on our origin | Opaque origin: no app DOM, no storage |
| Canvas | Direct | `OffscreenCanvas` transferred to it | Its own `<canvas>` inside the iframe |
| Per-frame talk | Direct call | Run the whole loop inside the worker; only input goes in | `postMessage` |
| Complexity | Lowest | Low | Medium (srcdoc, messaging, CSP) |

Sources:

- `Worker.terminate()` "does not offer the worker an opportunity to finish its operations; it is stopped at once" (MDN `Worker.terminate`, read via WebFetch).
- `sandbox` without `allow-same-origin`: content "is treated as being from a unique opaque origin". `allow-scripts` + `allow-same-origin` together let the page "simply remove the sandbox attribute and then reload itself" ([HTML spec, iframe](https://html.spec.whatwg.org/multipage/iframe-embed-object.html)).
- `canvas.transferControlToOffscreen()` + `worker.postMessage({canvas}, [canvas])`, and drawing in the worker "will be rendered on the source canvas automatically" ([web.dev OffscreenCanvas](https://web.dev/articles/offscreen-canvas)).
- `DedicatedWorkerGlobalScope includes AnimationFrameProvider`, so a worker gets `requestAnimationFrame` ([HTML spec, animation frames](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html)).
- Support ([mdn/browser-compat-data](https://github.com/mdn/browser-compat-data)): OffscreenCanvas + 2D context Chrome 69 / Firefox 105 / Safari 16.4. Worker `requestAnimationFrame` Chrome 69 / Firefox 99 / Safari 16.4. Module workers Chrome 80 / Firefox 114 / Safari 15.

**Threat model:** in the MVP the student only runs their own code (no sharing, no accounts). The real risks are self-inflicted: freezing the tab, crashing the app, or losing editor text. A worker covers all three. If we later run *other people's* code (shared levels), wrap the worker in a `sandbox="allow-scripts"` iframe to cut off our origin's IndexedDB and `fetch`.

### Wiring the game loop (recommended)

```
main thread                          worker (new one per Run)
-----------                          ------------------------
Monaco editor                        engine: loop via self.requestAnimationFrame
keydown/keyup  --postMessage-->      Input.getKey() reads a key Set
canvas.transferControlToOffscreen -> OffscreenCanvas 2D: draws player
watchdog timer <--"tick" each frame  calls student update(dt) in try/catch
lesson UI      <--"check"/"error"    Checks run on game state, post results
```

All of the per-frame work stays inside one thread, so nothing is sent per frame except a tiny heartbeat. A fresh worker per Run also resets all game state for free.

Note: an `OffscreenCanvas` can only be transferred once per `<canvas>`, so on each Run replace the `<canvas>` element (or keep the worker alive and just swap in new student code. Replacing is simpler and also clears stuck state).

## 3. Stopping infinite loops

| Method | Catches | Tells student the line? | Cost |
|---|---|---|---|
| Worker heartbeat + `terminate()` | Everything (loops, recursion that doesn't overflow, huge work) | No | ~10 lines |
| Loop-guard injection ([jsbin/loop-protect](https://github.com/jsbin/loop-protect)) | `for` / `while` / `do` only, not recursion. It rewrites loops to `break` (or throw) after a timeout, default 100 ms | Yes (callback gets `line`) | Needs Babel (big) or our own AST pass; repo looks unmaintained (Travis CI badge, no releases) |
| Timeouts on the same thread | Nothing: a sync loop never yields to the timer | - | - |

**MVP:** heartbeat + `terminate()` only, with a friendly message ("Your code ran forever. Look at your `while`/`for` loops."). **Later:** a loop guard that throws with the line number, built on the TS AST (Monaco's worker already has the compiler loaded).

## 4. Mapping runtime errors to editor lines

1. Transpile with Sucrase, so line N of the JS is line N of the TS.
2. In the worker: `const url = URL.createObjectURL(new Blob([js], {type: "text/javascript"})); const mod = await import(url);`. Module scripts from Blob URLs give stack frames like `blob:https://app/uuid:LINE:COL`, with no `new Function` header-line offsets (those differ between engines; V8 only reports eval frames as "eval at position", per the [V8 stack trace API](https://v8.dev/docs/stack-trace-api)).
3. Wrap each `update(dt)` call in `try/catch`, regex the first `blob:` frame for `:(\d+):(\d+)`, post `{message, line, col}`, then call `monaco.editor.setModelMarkers(model, "runtime", [...])` to draw a red squiggle on that line.
4. Syntax errors at import time: Monaco's diagnostics catch these before Run, so they never get here.

If we ever switch to TS emit, set `sourceMap: true` and decode the `.js.map` from `getEmitOutput().outputFiles` with a VLQ decoder. That's more moving parts, which is why Sucrase wins.

## Recommendation (beginner-friendly MVP)

1. **Check:** Monaco TS worker (already loaded) shows type errors live. Run is disabled while Error markers exist, plus a plain-English explanation.
2. **Transpile:** `sucrase` `transform(code, {transforms: ["typescript"]})` (≈48 KB, sub-millisecond, same line numbers).
3. **Run:** a new module Web Worker per Run, which owns the game loop (`requestAnimationFrame`), the OffscreenCanvas 2D drawing, the student module (Blob URL `import()`) and the Checks. The main thread sends key events and runs a 1 s heartbeat watchdog that calls `terminate()`.
4. **Errors:** `try/catch` around `update(dt)`, parse the `blob:` stack line, show a runtime marker in Monaco, and pause the game.

Browser floor: Safari 16.4 / Chrome 80 / Firefox 114.

Deferred: loop-guard line numbers, iframe hardening for shared code, a fallback for browsers without OffscreenCanvas.
