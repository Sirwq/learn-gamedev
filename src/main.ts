import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import { transpile } from "./run-utils";
import { marked } from "marked";
import { course } from "./lessons/course";
import { markPassed } from "./check";
import engineApi from "./engine-api.d.ts?raw";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(engineApi, "file:///engine-api.d.ts");

const lessonIndex = 0;
const lesson = course[lessonIndex];
document.getElementById("lesson-title")!.textContent = lesson.title;
document.getElementById("explanation")!.innerHTML = marked.parse(lesson.explanation, { async: false }); // our own trusted Markdown

// shortcut: only the Player Script gets an editor, until tabs land (ticket 022).
const model = monaco.editor.createModel(lesson.scripts.Player.stub, "typescript", monaco.Uri.parse("file:///Player.ts"));
monaco.editor.create(document.getElementById("editor")!, { model, theme: "vs-dark", automaticLayout: true });

const runBtn = document.getElementById("run") as HTMLButtonElement;
const status = document.getElementById("status")!;
const goalsList = document.getElementById("goals")!;
const overlay = document.getElementById("overlay")!;
const overlayText = document.getElementById("overlay-text")!;
const overlayRun = document.getElementById("overlay-run")!;

function showGoals(met: boolean[]) {
  goalsList.replaceChildren(...lesson.goals.map((g, i) => {
    const li = document.createElement("li");
    li.textContent = `${met[i] ? "✓" : "⬜"} ${g.message}`;
    return li;
  }));
}

function showOverlay(text: string, withRun: boolean) {
  overlayText.textContent = text;
  overlayRun.hidden = !withRun;
  overlay.hidden = !text;
}
showGoals([]);

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
  showGoals([]);
  showOverlay("", false);

  // A canvas can hand itself to a worker only once, so each Run gets a fresh one.
  const old = document.getElementById("game") as HTMLCanvasElement;
  const canvas = old.cloneNode() as HTMLCanvasElement;
  old.replaceWith(canvas);
  canvas.onkeydown = canvas.onkeyup = (e) => {
    e.preventDefault();
    worker?.postMessage({ type: "key", code: e.code, down: e.type === "keydown" });
  };
  canvas.focus();

  const offscreen = canvas.transferControlToOffscreen();
  worker = new RunnerWorker();
  worker.postMessage({ canvas: offscreen, lesson: lessonIndex, scripts: { Player: transpile(model.getValue()) } }, [offscreen]);

  let lastTick = performance.now();
  worker.onmessage = (e) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "check") {
      showGoals(e.data.met);
      if (e.data.lost || e.data.passed) clearInterval(watchdog); // the worker stopped its loop on purpose
      if (e.data.lost) showOverlay(e.data.lost, true);
      if (e.data.passed) {
        markPassed(lesson.title);
        showOverlay("✓ Lesson passed", false);
      }
    }
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

runBtn.onclick = overlayRun.onclick = run;
