import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import { transpile } from "./run-utils";
import { marked } from "marked";
import { course } from "./lessons/course";
import { loadScripts, openedHints, saveOpenedHints, saveScript } from "./lesson";
import { markPassed, progress, referenceFor, unlocked } from "./check";
import { addLine, clearLines, type ConsoleLine, lineText } from "./console";
import engineApi from "./engine-api.d.ts?raw";
import { anchor, docLink, docPages } from "./docs";
import { tutorPrompt } from "./lessons/ai-note";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(engineApi, "file:///engine-api.d.ts");

const asked = Number(new URLSearchParams(location.search).get("lesson")); // shortcut: ?lesson=N until the Course menu picks Lessons
const lessonIndex = Number.isInteger(asked) && unlocked(course, asked) ? asked : 0;
const lesson = course[lessonIndex];
document.getElementById("lesson-title")!.textContent = lesson.title;
const explanation = document.getElementById("explanation")!;
explanation.innerHTML = marked.parse(lesson.explanation, { async: false }); // our own trusted Markdown
const pages = docPages(engineApi);
// API names in the Explanation link to their Docs member.
for (const code of Array.from(explanation.querySelectorAll(":not(pre) > code"))) {
  const id = docLink(pages, code.textContent!);
  if (!id) continue;
  const a = document.createElement("a");
  a.href = `#${anchor(id)}`;
  code.replaceWith(a);
  a.append(code);
}

const hints = lesson.hints ?? [];
const stillStuck = document.getElementById("still-stuck")!;
const nextHint = document.getElementById("next-hint") as HTMLButtonElement;
function showHints(opened: number) {
  document.getElementById("hints")!.replaceChildren(...hints.slice(0, opened).map((hint, i) => {
    const div = document.createElement("div");
    div.innerHTML = marked.parse(`**💡 Hint ${i + 1}**\n\n${hint}`, { async: false });
    return div;
  }));
  nextHint.textContent = `💡 Hint ${opened + 1} of ${hints.length}`;
  nextHint.hidden = opened >= hints.length;
  stillStuck.hidden = !nextHint.hidden;
}
let opened = Math.min(openedHints(lesson.title), hints.length);
nextHint.onclick = () => {
  saveOpenedHints(lesson.title, ++opened);
  showHints(opened);
};
showHints(opened);

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

// One Monaco model per Script: models share one TS project, so each file type-checks against the others.
const models = Object.fromEntries(Object.entries(loadScripts(course, lessonIndex)).map(([name, code]) => {
  const model = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(`file:///${name}.ts`));
  model.onDidChangeContent(() => {
    monaco.editor.setModelMarkers(model, "runtime", []);
    saveScript(name, model.getValue());
  });
  return [name, model];
}));
const editor = monaco.editor.create(document.getElementById("editor")!, { theme: "vs-dark", automaticLayout: true });
const tabs = [...Object.keys(models).map((name) => `${name}.ts`), "📖 Docs"].map((label) => {
  const tab = document.createElement("button");
  tab.role = "tab";
  tab.textContent = label;
  tab.onclick = () => (label === "📖 Docs" ? openDocs() : show(label.slice(0, -3)));
  return tab;
});
document.getElementById("tabs")!.append(...tabs);
const selectTab = (label: string) => {
  for (const tab of tabs) tab.ariaSelected = String(tab.textContent === label);
};
const editorEl = document.getElementById("editor")!;
const docsEl = document.getElementById("docs")!;
let openScript = ""; // stays the last one shown while Docs or Compare is open
function show(name: string) {
  openScript = name;
  editor.setModel(models[name]);
  editorEl.hidden = false;
  docsEl.hidden = true;
  selectTab(`${name}.ts`);
}

// Docs tab: one page at a time; `#doc-…` links anywhere open the page holding that member.
const docsArticle = docsEl.querySelector("article")!;
const docsNav = pages.map((page) => {
  const b = document.createElement("button");
  b.textContent = page.title;
  b.onclick = () => openDocs(page.title);
  return b;
});
docsEl.querySelector("nav")!.append(...docsNav);
let docsPage = pages[0].title;
function openDocs(target = docsPage) {
  const page = pages.find((p) => p.title === target || p.ids.includes(target))!;
  if (page.title !== docsPage || !docsArticle.hasChildNodes()) {
    docsPage = page.title;
    docsArticle.innerHTML = marked.parse(page.markdown, { async: false }); // generated from our own typings
    docsArticle.scrollTop = 0;
    for (const b of docsNav) b.ariaCurrent = b.textContent === page.title ? "page" : null;
  }
  editorEl.hidden = true;
  docsEl.hidden = false;
  selectTab("📖 Docs");
  if (target !== page.title) document.getElementById(anchor(target))?.scrollIntoView();
}
document.addEventListener("click", (e) => {
  const link = (e.target as Element).closest?.("a[href^='#doc-']");
  if (!link) return;
  e.preventDefault();
  openDocs(link.getAttribute("href")!.slice("#doc-".length));
});
show(Object.keys(models)[0]);
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());

const runBtn = document.getElementById("run") as HTMLButtonElement;
const stopBtn = document.getElementById("stop")!;
const status = document.getElementById("status")!;
const goalsList = document.getElementById("goals")!;
const overlay = document.getElementById("overlay")!;
const overlayText = document.getElementById("overlay-text")!;
const overlayRun = document.getElementById("overlay-run")!;
const passBox = document.getElementById("pass")!;

// Pass screen: one Compare per Script this Lesson touched, then Next Lesson (unlocked by this pass).
passBox.append(...Object.keys(lesson.scripts).map((name) => {
  const b = document.createElement("button");
  b.textContent = `Compare ${name}.ts`;
  b.onclick = () => openCompare(name);
  return b;
}));
if (lessonIndex + 1 < course.length) {
  const next = document.createElement("button");
  next.id = "next";
  next.textContent = "Next Lesson ▶";
  next.onclick = () => (location.search = `?lesson=${lessonIndex + 1}`);
  passBox.append(next);
}

function toast(text: string) {
  const t = document.createElement("div");
  t.textContent = text;
  t.onanimationend = () => t.remove();
  document.getElementById("toasts")!.append(t);
}

// The Reference model is JavaScript so the TS project never sees a second `class Player`; its diagnostics are off.
monaco.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: true });
const compare = document.getElementById("compare")!;
const diff = monaco.editor.createDiffEditor(document.getElementById("diff")!, {
  theme: "vs-dark", readOnly: true, wordWrap: "on", automaticLayout: true,
});
let comparing = "";
function openCompare(name: string) {
  const reference = referenceFor(course, name);
  if (reference === undefined) return;
  comparing = name;
  diff.getModel()?.modified.dispose();
  diff.setModel({ original: models[name], modified: monaco.editor.createModel(reference, "javascript") });
  document.getElementById("compare-title")!.textContent = `Compare ${name}.ts`;
  compare.hidden = false;
  diff.getModifiedEditor().focus(); // so Esc closes it
}
function closeCompare() {
  compare.hidden = true;
  show(comparing);
  editor.focus();
}
document.getElementById("compare-close")!.onclick = closeCompare;
compare.onkeydown = (e) => e.key === "Escape" && closeCompare();
document.getElementById("load-reference")!.onclick = () => {
  const model = models[comparing];
  // An edit, not setValue, so Ctrl+Z brings the student's code back.
  model.pushEditOperations([], [{ range: model.getFullModelRange(), text: diff.getModel()!.modified.getValue() }], () => null);
};

let goalsMet: boolean[] = [];
function showGoals(met: boolean[]) {
  goalsMet = met;
  goalsList.replaceChildren(...lesson.goals.map((g, i) => {
    const li = document.createElement("li");
    li.textContent = `${met[i] ? "✓" : "⬜"} ${g.message}`;
    return li;
  }));
}

function showOverlay(text: string, withRun: boolean, passed = false) {
  overlayText.textContent = text;
  overlayRun.hidden = !withRun;
  passBox.hidden = !passed;
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
  Object.values(models).some((model) => monaco.editor
    .getModelMarkers({ resource: model.uri })
    .some((m) => m.owner !== "runtime" && m.severity === monaco.MarkerSeverity.Error));
monaco.editor.onDidChangeMarkers(() => {
  const blocked = hasTypeErrors();
  if (blocked !== runBtn.disabled) status.textContent = blocked ? "Fix the red squiggles before running." : "";
  runBtn.disabled = blocked;
});

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
  for (const model of Object.values(models)) monaco.editor.setModelMarkers(model, "runtime", []);
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
  worker.postMessage({ canvas: offscreen, lesson: lessonIndex, scripts: Object.fromEntries(Object.entries(models).map(([n, m]) => [n, transpile(m.getValue())])) }, [offscreen]);

  let lastTick = performance.now();
  worker.onmessage = (e) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "paused") paused = e.data.paused;
    if (e.data.type === "logs") log(e.data.lines);
    if (e.data.type === "check") {
      showGoals(e.data.met);
      if (e.data.lost || e.data.passed) ended(); // the worker stopped its loop on purpose
      if (e.data.lost) showOverlay(e.data.lost, true);
      if (e.data.passed) {
        markPassed(lesson.title);
        showProgress();
        showOverlay("✓ Lesson passed", false, true);
        toast("Lesson passed");
      }
    }
    if (e.data.type === "error") {
      ended(); // the worker already stopped its loop; terminating now would blank the last frame
      const where = e.data.script && e.data.line ? `${e.data.script}.ts:${e.data.line} ` : "";
      log([{ level: "error", text: `${where}${e.data.message}`, count: 1 }]);
      const model = models[e.data.script];
      if (model && e.data.line) {
        show(e.data.script);
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

// Ask DeepSeek: copy the Tutor prompt, open a plain chat (no ?q= prefill, spec 010).
const promptBox = document.getElementById("prompt-box") as HTMLDialogElement;
const promptText = promptBox.querySelector("textarea")!;
document.getElementById("prompt-select")!.onclick = () => promptText.select();
document.getElementById("prompt-close")!.onclick = () => promptBox.close();
document.getElementById("ask")!.onclick = async () => {
  const prompt = tutorPrompt({
    title: lesson.title,
    explanation: lesson.explanation,
    goals: lesson.goals.map((g, i) => ({ message: g.message, met: !!goalsMet[i] })),
    hints: hints.slice(0, opened),
    script: { name: openScript, code: models[openScript].getValue() },
    console: consoleLines.map(lineText),
  });
  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    promptText.value = prompt;
    promptBox.showModal();
    promptText.select();
    return;
  }
  window.open("https://chat.deepseek.com", "_blank"); // after copying: a focused new tab would make the copy fail
  toast("Prompt copied. In DeepSeek: Ctrl/Cmd+V, type your question at the end, Enter.");
  if (!localStorage.getItem("asked-deepseek")) {
    localStorage.setItem("asked-deepseek", "1");
    toast("You need a free DeepSeek account.");
  }
};
