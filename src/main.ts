import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import { transpile } from "./run-utils";
import { marked } from "marked";
import { course } from "./lessons/course";
import { markPassed, progress } from "./check";
import { addLine, clearLines, type ConsoleLine, lineText } from "./console";
import engineApi from "./engine-api.d.ts?raw";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(engineApi, "file:///engine-api.d.ts");

const lessonIndex = 0;
const lesson = course[lessonIndex];
document.getElementById("lesson-title")!.textContent = lesson.title;
document.getElementById("explanation")!.innerHTML = marked.parse(lesson.explanation, { async: false }); // our own trusted Markdown

function showProgress() {
  const done = progress(course);
  const label = document.createElement("span");
  label.textContent = `${done.filter(Boolean).length} / ${course.length}`;
  document.getElementById("progress")!.replaceChildren(...done.map((d, i) => {
    const pip = document.createElement("i");
    pip.className = d ? "done" : "";
    pip.title = course[i].title;
    return pip;
  }), label);
}
showProgress();

// shortcut: only the Player Script gets an editor and a tab, until many Scripts land (ticket 022).
const tab = document.createElement("span");
tab.role = "tab";
tab.textContent = "Player.ts";
document.getElementById("tabs")!.append(tab);
const model = monaco.editor.createModel(lesson.scripts.Player.stub, "typescript", monaco.Uri.parse("file:///Player.ts"));
const editor = monaco.editor.create(document.getElementById("editor")!, { model, theme: "vs-dark", automaticLayout: true });
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());

const runBtn = document.getElementById("run") as HTMLButtonElement;
const stopBtn = document.getElementById("stop")!;
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

const consoleEl = document.getElementById("console")!;
const consoleLines: ConsoleLine[] = [];
function log(batch: ConsoleLine[]) {
  for (const l of batch) addLine(consoleLines, l.level, l.text, l.count);
  const atBottom = consoleEl.scrollTop + consoleEl.clientHeight >= consoleEl.scrollHeight - 4;
  consoleEl.replaceChildren(...consoleLines.map((l) => {
    const div = document.createElement("div");
    div.className = l.level;
    div.textContent = lineText(l);
    return div;
  }));
  if (atBottom) consoleEl.scrollTop = consoleEl.scrollHeight; // follow new lines unless the student scrolled up
}

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
let running = false; // a Run's game loop is live (maybe paused)
let paused = false; // the worker confirmed it stopped its frames

/** The game loop ended (or will): the last frame stays on the canvas. */
function ended() {
  running = false;
  clearInterval(watchdog);
  stopBtn.hidden = true;
}

function stop() {
  worker?.terminate();
  ended();
}

function run() {
  if (hasTypeErrors()) return;
  stop();
  monaco.editor.setModelMarkers(model, "runtime", []);
  status.textContent = "";
  clearLines(consoleLines);
  log([]);
  showGoals([]);
  showOverlay("", false);

  // A canvas can hand itself to a worker only once, so each Run gets a fresh one.
  const old = document.getElementById("game") as HTMLCanvasElement;
  const canvas = old.cloneNode() as HTMLCanvasElement;
  old.replaceWith(canvas);
  canvas.onkeydown = canvas.onkeyup = (e) => {
    if (e.code === "Tab") return; // keep a way out for keyboard users; leaving pauses the game
    e.preventDefault(); // arrows and Space don't scroll the page
    if (e.code === "Escape") return editor.focus();
    worker?.postMessage({ type: "key", code: e.code, down: e.type === "keydown" });
  };
  // Leaving the game pauses it, so no Goals or Lose events happen while the student isn't playing.
  canvas.onblur = () => {
    if (!running) return;
    worker?.postMessage({ type: "pause" });
    showOverlay("Click to play", false);
  };
  canvas.onfocus = () => {
    if (!running) return;
    paused = false;
    worker?.postMessage({ type: "resume" });
    showOverlay("", false);
  };

  const offscreen = canvas.transferControlToOffscreen();
  worker = new RunnerWorker();
  stopBtn.hidden = false;
  running = true;
  paused = false;
  canvas.focus();
  worker.postMessage({ canvas: offscreen, lesson: lessonIndex, scripts: { Player: transpile(model.getValue()) } }, [offscreen]);

  let lastTick = performance.now();
  worker.onmessage = (e) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "paused") paused = true;
    if (e.data.type === "logs") log(e.data.lines);
    if (e.data.type === "check") {
      showGoals(e.data.met);
      if (e.data.lost || e.data.passed) ended(); // the worker stopped its loop on purpose
      if (e.data.lost) showOverlay(e.data.lost, true);
      if (e.data.passed) {
        markPassed(lesson.title);
        showProgress();
        showOverlay("✓ Lesson passed", false);
      }
    }
    if (e.data.type === "error") {
      ended(); // the worker already stopped its loop; terminating now would blank the last frame
      const where = e.data.script && e.data.line ? `${e.data.script}.ts:${e.data.line} ` : "";
      log([{ level: "error", text: `${where}${e.data.message}`, count: 1 }]);
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
    if (document.hidden || paused) lastTick = performance.now(); // hidden tabs pause animation frames, that's not a hang
    else if (performance.now() - lastTick > 1000) {
      stop();
      status.textContent = "Your code ran forever. Look at your while / for loops.";
    }
  }, 250);
}

runBtn.onclick = overlayRun.onclick = run;
overlay.onclick = (e) => {
  if (running && e.target !== overlayRun) document.getElementById("game")!.focus(); // "Click to play"
};
stopBtn.onclick = stop;
