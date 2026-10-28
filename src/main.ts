import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import { transpile } from "./run-utils";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(
  "declare const ctx: OffscreenCanvasRenderingContext2D;\ndeclare const keys: ReadonlySet<string>;",
  "file:///globals.d.ts",
);

const starter = `let x = 100;

export function update(dt: number) {
  if (keys.has("ArrowRight")) x += 200 * dt;
  if (keys.has("ArrowLeft")) x -= 200 * dt;
  ctx.fillStyle = "orange";
  ctx.fillRect(x, 300, 32, 32);
}
`;

const model = monaco.editor.createModel(starter, "typescript", monaco.Uri.parse("file:///Player.ts"));
monaco.editor.create(document.getElementById("editor")!, { model, theme: "vs-dark", automaticLayout: true });

const runBtn = document.getElementById("run") as HTMLButtonElement;
const status = document.getElementById("status")!;

// Type errors block Run; our own "runtime" markers don't.
const hasTypeErrors = () =>
  monaco.editor
    .getModelMarkers({ resource: model.uri })
    .some((m) => m.owner !== "runtime" && m.severity === monaco.MarkerSeverity.Error);
monaco.editor.onDidChangeMarkers(() => {
  const blocked = hasTypeErrors();
  if (blocked !== runBtn.disabled) status.textContent = blocked ? "Fix the red squiggles before running." : "";
  runBtn.disabled = blocked;
});
model.onDidChangeContent(() => monaco.editor.setModelMarkers(model, "runtime", []));

let worker: Worker | undefined;
let watchdog: number | undefined;

function stop() {
  worker?.terminate();
  clearInterval(watchdog);
}

function run() {
  if (hasTypeErrors()) return;
  stop();
  monaco.editor.setModelMarkers(model, "runtime", []);
  status.textContent = "";

  // A canvas can hand itself to a worker only once, so each Run gets a fresh one.
  const old = document.getElementById("game") as HTMLCanvasElement;
  const canvas = old.cloneNode() as HTMLCanvasElement;
  old.replaceWith(canvas);
  canvas.onkeydown = canvas.onkeyup = (e) => {
    e.preventDefault();
    worker?.postMessage({ type: "key", key: e.key, down: e.type === "keydown" });
  };
  canvas.focus();

  const offscreen = canvas.transferControlToOffscreen();
  worker = new RunnerWorker();
  worker.postMessage({ canvas: offscreen, js: transpile(model.getValue()) }, [offscreen]);

  let lastTick = performance.now();
  worker.onmessage = (e) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "error") {
      clearInterval(watchdog); // the worker already stopped its loop; terminating now would blank the last frame
      status.textContent = `Error: ${e.data.message}`;
      if (e.data.line) {
        monaco.editor.setModelMarkers(model, "runtime", [{
          severity: monaco.MarkerSeverity.Error,
          message: e.data.message,
          startLineNumber: e.data.line,
          startColumn: e.data.col,
          endLineNumber: e.data.line,
          endColumn: model.getLineMaxColumn(e.data.line),
        }]);
      }
    }
  };
  watchdog = setInterval(() => {
    if (document.hidden) lastTick = performance.now(); // hidden tabs pause animation frames, that's not a hang
    else if (performance.now() - lastTick > 1000) {
      stop();
      status.textContent = "Your code ran forever. Look at your while / for loops.";
    }
  }, 250);
}

runBtn.onclick = run;
