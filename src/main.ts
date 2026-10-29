import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import type { FromWorker, ToWorker } from "./runner-protocol";
import { modKey, runShortcut, runStartLine, transpile, v2Features } from "./run-utils";
import { loadMuted, playClips, saveMuted, stopSounds, unlockAudio } from "./sound";
import { drawLabels, loadFont, textList } from "./gui";
import type { Label } from "./engine";
import { FONT_MAX, FONT_MIN, savedFontSize, zoom, zoomPercent } from "./zoom";
import { marked } from "marked";
import { course } from "./lessons/course";
import { loadScripts, openedHints, restoreStash, saveOpenedHints, saveScript, saveSnapshot } from "./lesson";
import { currentLesson, markPassed, progress, referenceFor, unlocked } from "./check";
import { addLine, clearLines, type ConsoleLine, lineText } from "./console";
import engineApi from "./engine-api.d.ts?raw";
import { anchor, docLink, docPages } from "./docs";
import { tutorPrompt } from "./lessons/ai-note";
import { achievements, loadEarned, saveEarned, stateOf } from "./achievements";
import { Camera, GameObject, Vector2 } from "./engine";
import { drawWorld, loadImages } from "./sprites";
import { courseMenu } from "./menu";
import { toast } from "./toast";
import { deleteProject, duplicateProject, exportFileName, exportProject, loadProjects, migrateProjects, type Project, sandboxUnlocked, saveProject, scriptNameError, scriptStub } from "./sandbox";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(engineApi, "file:///engine-api.d.ts");

// The Course menu picks a Lesson by reloading with ?lesson=N, a Sandbox Project with ?sandbox=id;
// without either the app opens on the menu, over the current Lesson (?sandbox with no Project: on the Sandbox menu).
const params = new URLSearchParams(location.search);
const asked = params.get("lesson");
const askedProject = sandboxUnlocked(course) ? params.get("sandbox") : null;
// Project writes are async: a full disk surfaces here, so the student knows the change was not kept.
addEventListener("unhandledrejection", (e) => {
  if (e.reason?.name === "QuotaExceededError") toast("Storage is full: your last Project change was not saved. Delete a Project you no longer need and try again.");
});
await migrateProjects();
const projects = await loadProjects();
const project: Project | undefined = projects.find((p) => p.id === askedProject);
const current = currentLesson(course);
const lessonIndex = asked !== null && Number.isInteger(Number(asked)) && unlocked(course, Number(asked)) ? Number(asked) : current;
const replaying = !project && lessonIndex !== current;
if (!replaying && !project) restoreStash(); // before the editor loads the code
const lesson = course[lessonIndex];
const lessonTitle = document.getElementById("lesson-title")!;
lessonTitle.textContent = project ? project.name : lesson.title;
document.title = `${lessonTitle.textContent} · learn-dev`;
document.getElementById("replaying")!.hidden = !replaying;
const explanation = document.getElementById("explanation")!;
if (!project) explanation.innerHTML = marked.parse(lesson.explanation, { async: false }); // our own trusted Markdown
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

const hints = project ? [] : (lesson.hints ?? []);
const stillStuck = document.getElementById("still-stuck")!;
const nextHint = document.getElementById("next-hint") as HTMLButtonElement;
function showHints(opened: number) {
  document.getElementById("hints")!.replaceChildren(...hints.slice(0, opened).map((hint, i) => {
    const div = document.createElement("div");
    div.innerHTML = marked.parse(`**💡 Hint ${i + 1}**\n\n${hint}`, { async: false });
    return div;
  }));
  nextHint.textContent = `💡 Hint ${opened + 1} of ${hints.length}`;
  nextHint.ariaLabel = `Hint ${opened + 1} of ${hints.length}`;
  nextHint.hidden = opened >= hints.length;
  stillStuck.hidden = !nextHint.hidden || !!project;
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
  const button = document.getElementById("progress")!;
  button.ariaLabel = `${label.textContent} Lessons passed, back to Lessons`;
  button.replaceChildren(...done.map((d, i) => {
    const pip = document.createElement("i");
    pip.className = d ? "done" : "";
    pip.title = course[i].title;
    pip.ariaHidden = "true";
    return pip;
  }), label);
}
showProgress();

// One Monaco model per Script: models share one TS project, so each file type-checks against the others.
// A Project keeps its own copy of the code, so Sandbox and Course never write to each other.
const models: Record<string, monaco.editor.ITextModel> = {};
function addModel(name: string, code: string) {
  const model = (models[name] = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(`file:///${name}.ts`)));
  model.onDidChangeContent(() => {
    monaco.editor.setModelMarkers(model, "runtime", []);
    if (!project) return saveScript(name, model.getValue());
    project.scripts[name] = model.getValue();
    saveProject(project);
  });
}
for (const [name, code] of Object.entries(project?.scripts ?? loadScripts(course, lessonIndex))) addModel(name, code);
// The editor and Compare use the page's palette, read from the CSS tokens in index.html.
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
const root = document.documentElement;
function applyTheme() {
  const light = root.dataset.theme === "light";
  monaco.editor.defineTheme("page", {
    base: light ? "vs" : "vs-dark", inherit: true, rules: [],
    colors: {
      "editor.background": token("surface-editor"),
      "editor.lineHighlightBackground": token("surface-panel"),
      "editorLineNumber.foreground": token("border-control"),
      "editorLineNumber.activeForeground": token("ink-muted"),
      "editorCursor.foreground": light ? token("accent-strong") : token("accent"),
      "focusBorder": token("focus"),
    },
  });
  monaco.editor.setTheme("page");
  themeButton.textContent = light ? "☾" : "☀";
  themeButton.title = themeButton.ariaLabel = light ? "Switch to dark theme" : "Switch to light theme";
}
const themeButton = document.getElementById("theme")!;
themeButton.onclick = () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  applyTheme();
};
applyTheme();
const editor = monaco.editor.create(document.getElementById("editor")!, {
  theme: "page",
  automaticLayout: true,
  minimap: { enabled: false },
  ariaLabel: "Code editor. Press Escape, then Tab to leave it.",
});
// Tab indents, so Esc turns on Monaco's "Tab moves focus" until the next other key or leaving the editor.
editor.onKeyDown((e) => {
  if (e.keyCode === monaco.KeyCode.Escape) editor.updateOptions({ tabFocusMode: true });
  else if (e.keyCode !== monaco.KeyCode.Tab && e.keyCode !== monaco.KeyCode.Shift) editor.updateOptions({ tabFocusMode: false });
});
editor.onDidBlurEditorText(() => editor.updateOptions({ tabFocusMode: false }));
function makeTab(label: string) {
  const tab = document.createElement("button");
  tab.role = "tab";
  tab.textContent = label;
  if (label === "📖 Docs") tab.ariaLabel = "Docs";
  tab.onclick = () => (label === "📖 Docs" ? openDocs() : show(label.slice(0, -3)));
  return tab;
}
const tabs = [...Object.keys(models).map((name) => `${name}.ts`), "📖 Docs"].map(makeTab);
document.getElementById("tabs")!.append(...tabs);
if (project) {
  const addScript = document.createElement("button");
  addScript.textContent = "+ Script";
  addScript.title = "Add a new Script file";
  addScript.onclick = () => {
    const name = prompt("Name of the new Script (its class name, like Coin):")?.trim();
    if (!name) return;
    const error = scriptNameError(name, Object.keys(models));
    if (error) return void toast(error);
    addModel(name, scriptStub(name));
    project.scripts[name] = scriptStub(name);
    saveProject(project);
    const tab = makeTab(`${name}.ts`);
    tabs.splice(tabs.length - 1, 0, tab);
    tabs[tabs.length - 1].before(tab);
    show(name);
  };
  document.getElementById("tabs")!.append(addScript);
}
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
runBtn.querySelector("kbd")!.textContent = runShortcut(navigator.platform);
runBtn.title = `Run (${runShortcut(navigator.platform)})`;
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
const nextIndex = replaying ? current : lessonIndex + 1;
if (nextIndex < course.length) {
  const next = document.createElement("button");
  next.id = "next";
  next.textContent = replaying ? `Back to Lesson ${current + 1}` : "Next Lesson ▶";
  next.onclick = () => (location.search = `?lesson=${nextIndex}`);
  passBox.append(next);
}

// Achievements: earned in the worker, saved and shown here.
const earned = loadEarned();
const trophies = document.getElementById("trophies")!;
const map = document.getElementById("achievements")!;
function showTrophies() {
  trophies.textContent = `🏆 ${earned.size} / ${achievements.length}`;
  trophies.ariaLabel = `Achievements ${earned.size} / ${achievements.length}`;
}
showTrophies();
function earn(ids: string[]) {
  for (const id of ids) {
    const a = achievements.find((a) => a.id === id)!;
    earned.add(id);
    saveEarned(id);
    const t = toast("");
    t.className = "achievement";
    t.innerHTML = `<i class="tile">${a.icon}</i><span><small>Achievement unlocked</small><b>${a.title}</b></span>`; // our own data
  }
  showTrophies();
  if (!map.hidden) drawMap();
}
const CELL = 76;
const EXTRA = "Extra: no Lesson teaches this. Build it in your own Player code, in any Lesson or a Sandbox Project.";
const centre = (a: (typeof achievements)[number]) => [a.col * CELL + CELL / 2, a.row * CELL + CELL / 2];
function drawMap() {
  map.querySelector("header span")!.textContent = `${earned.size} earned · gold = earned · grey = can earn now · ? = earn the one before it first`;
  const [w, h] = [13 * CELL, 10 * CELL];
  // Right-angled arrows, each stopping at the edge of the tile it points to.
  const lines = achievements.filter((a) => a.after).map((a) => {
    const [x1, y1] = centre(achievements.find((p) => p.id === a.after)!), [x2, y2] = centre(a);
    const pts = x1 === x2 || y1 === y2 ? [[x1, y1], [x2, y2]] : a.vertical ? [[x1, y1], [x1, y2], [x2, y2]] : [[x1, y1], [x2, y1], [x2, y2]];
    const [ax, ay] = pts[pts.length - 2], s = 30 / Math.hypot(x2 - ax, y2 - ay);
    pts[pts.length - 1] = [x2 - (x2 - ax) * s, y2 - (y2 - ay) * s];
    const lit = earned.has(a.id) ? "lit" : "";
    return `<polyline class="${lit}" points="${pts.join(" ")}" marker-end="url(#arrow${lit})"/>`;
  });
  const arrow = (id: string) => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z"/></marker>`;
  const tiles = achievements.map((a) => {
    const state = stateOf(a, earned), [x, y] = centre(a);
    const tip = state === "hidden" ? "???\nEarn the one before it first" : `${a.title}\n${a.message}${a.extra ? `\n${EXTRA}` : ""}${state === "earned" ? "\n✓ earned" : ""}`;
    return `<i class="tile ${state}" role="img" style="left:${x}px;top:${y}px" title="${tip}" aria-label="${tip}">${state === "hidden" ? "?" : `<span>${a.icon}</span>`}</i>`;
  });
  map.querySelector("#tree")!.innerHTML = `<svg width="${w}" height="${h}"><defs>${arrow("arrow")}${arrow("arrowlit")}</defs>${lines.join("")}</svg>${tiles.join("")}`;
  (map.querySelector("#tree") as HTMLElement).style.cssText = `width:${w}px;height:${h}px`;
}
trophies.onclick = () => {
  drawMap();
  map.hidden = false;
  document.getElementById("achievements-close")!.focus();
};
const closeMap = () => {
  map.hidden = true;
  (menu.hidden ? trophies : menu).focus();
};
document.getElementById("achievements-close")!.onclick = closeMap;
map.onkeydown = (e) => e.key === "Escape" && closeMap();

const images = loadImages();
// Before the first Run the game shows the Level as it starts; Run swaps in a fresh canvas for the worker.
const startLevel = project ? project.level : course[lessonIndex].level;
images.then((imgs) => drawWorld((document.getElementById("game") as HTMLCanvasElement).getContext("2d")!, imgs, new Camera(startLevel.camera),
  startLevel.boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y)))));
// The Course menu and its Sandbox tab.
const { menu, openMenu, setMode } = courseMenu({ lessonIndex, project, projects, askedProject, earned, images, focusEditor: () => editor.focus() });
if (asked === null && !project) openMenu(); // the app opens on the Course menu (or the Sandbox menu for ?sandbox)

// The Lesson strip of a Project: its name, Rename / Duplicate / Export / Delete.
if (project) {
  document.getElementById("project-actions")!.hidden = false;
  document.getElementById("rename")!.onclick = () => {
    const name = prompt("Project name:", project.name)?.trim();
    if (!name) return;
    project.name = lessonTitle.textContent = name;
    saveProject(project);
  };
  document.getElementById("duplicate")!.onclick = async () => (location.search = `?sandbox=${(await duplicateProject(project)).id}`);
  document.getElementById("export")!.onclick = async () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([await exportProject(project)], { type: "application/json" }));
    a.download = exportFileName(project.name);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href));
  };
  document.getElementById("delete")!.onclick = () => {
    if (!confirm(`Delete "${project.name}"? Its Scripts are gone for good.`)) return;
    deleteProject(project.id).then(() => (location.search = "?sandbox"));
  };
}

// The Reference model is JavaScript so the TS project never sees a second `class Player`; its diagnostics are off.
monaco.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: true });
const compare = document.getElementById("compare")!;
const diff = monaco.editor.createDiffEditor(document.getElementById("diff")!, {
  theme: "page", readOnly: true, wordWrap: "on", automaticLayout: true,
  minimap: { enabled: false }, renderOverviewRuler: false,
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

// Zoom: one font size for the editor, the Compare diff and the Docs tab, saved for Lessons and Sandbox alike.
const zoomOut = document.getElementById("zoom-out") as HTMLButtonElement;
const zoomReset = document.getElementById("zoom-reset") as HTMLButtonElement;
const zoomIn = document.getElementById("zoom-in") as HTMLButtonElement;
let fontSize = savedFontSize(localStorage.getItem("editor:fontSize"));
function setFontSize(size: number) {
  fontSize = size;
  localStorage.setItem("editor:fontSize", String(size));
  editor.updateOptions({ fontSize: size });
  diff.updateOptions({ fontSize: size });
  docsArticle.style.fontSize = `${size}px`;
  zoomReset.textContent = zoomPercent(size);
  zoomOut.disabled = size <= FONT_MIN;
  zoomIn.disabled = size >= FONT_MAX;
}
setFontSize(fontSize);
const mod = modKey(navigator.platform);
for (const [button, step, label, key, code] of [
  [zoomOut, -1, "Smaller code", "-", monaco.KeyCode.Minus],
  [zoomReset, 0, "Reset code size", "0", monaco.KeyCode.Digit0],
  [zoomIn, 1, "Bigger code", "=", monaco.KeyCode.Equal],
] as const) {
  button.ariaLabel = label;
  button.title = `${label} (${mod}${key})`;
  button.onclick = () => setFontSize(zoom(fontSize, step));
  // Only while an editor has focus, so browser zoom keeps working everywhere else.
  for (const ed of [editor, diff.getOriginalEditor(), diff.getModifiedEditor()])
    ed.addCommand(monaco.KeyMod.CtrlCmd | code, () => setFontSize(zoom(fontSize, step)));
}

let goalsMet: boolean[] = [];
const goals = project ? [] : lesson.goals;
goalsList.hidden = !goals.length;
function showGoals(met: boolean[]) {
  goalsMet = met;
  goalsList.replaceChildren(...goals.map((g, i) => {
    const li = document.createElement("li");
    const mark = document.createElement("span");
    mark.ariaHidden = "true";
    mark.textContent = met[i] ? "✓ " : "⬜ ";
    const state = document.createElement("span");
    state.className = "sr-only";
    state.textContent = met[i] ? "Done: " : "To do: ";
    li.append(mark, state, g.message);
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
const consoleToggle = document.getElementById("console-toggle")!;
function openConsole(open: boolean) {
  consoleToggle.ariaExpanded = String(open);
  consoleEl.hidden = !open;
  // Relayout now, not on the next resize tick, so the cursor line can be kept in view.
  editor.layout();
  const pos = editor.getPosition();
  if (pos) editor.revealPositionInCenterIfOutsideViewport(pos);
}
consoleToggle.onclick = () => openConsole(consoleEl.hidden);
function log(batch: ConsoleLine[]) {
  const wasEmpty = !consoleLines.length;
  for (const l of batch) addLine(consoleLines, l.level, l.text, l.count);
  document.getElementById("console-count")!.textContent = `${consoleLines.length} ${consoleLines.length === 1 ? "line" : "lines"}`;
  if (wasEmpty && consoleLines.length) openConsole(true); // once per Run, so a student who closes it keeps it closed
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

// Sound and screen text exist only in Sandbox and Chapter 2; so does the mute button.
const v2 = v2Features(project ? { level: project.level } : { lesson: lessonIndex });
const muteBtn = document.getElementById("mute") as HTMLButtonElement;
let muted = loadMuted(localStorage);
const showMute = () => {
  muteBtn.textContent = muted ? "🔇" : "🔊";
  muteBtn.setAttribute("aria-pressed", String(muted));
};
muteBtn.hidden = !v2;
showMute();
muteBtn.onmousedown = (e) => e.preventDefault(); // keep focus on the game, so clicking doesn't pause it
muteBtn.onclick = () => {
  muted = !muted;
  if (muted) stopSounds();
  try { saveMuted(localStorage, muted); } catch {}
  showMute();
};

// Screen text: the page draws the worker's labels over the game and lists them for screen readers.
const guiCtx = (document.getElementById("gui") as HTMLCanvasElement).getContext("2d")!;
const guiList = document.getElementById("gui-text")!;
const listTexts = textList((texts) => guiList.replaceChildren(...texts.map((t) => Object.assign(document.createElement("li"), { textContent: t }))));
const showLabels = (labels: Label[]) => (drawLabels(guiCtx, labels), listTexts(labels));
if (v2) loadFont().catch(() => {}); // the fallback font still shows the text

let worker: Worker | undefined;
const post = (message: ToWorker, transfer: Transferable[] = []) => worker?.postMessage(message, transfer);
let watchdog: number | undefined;
let running = false; // a Run's game loop is live (maybe paused)
let paused = false; // the worker confirmed it stopped its frames

/** The game loop ended (or will): the last frame stays on the canvas. */
function ended() {
  running = false;
  clearInterval(watchdog);
  const hadFocus = document.activeElement === stopBtn;
  stopBtn.hidden = true;
  runBtn.hidden = false;
  if (hadFocus) runBtn.focus();
}

function stop() {
  worker?.terminate();
  stopSounds();
  showLabels([]);
  ended();
}

function run() {
  if (hasTypeErrors()) return;
  stop();
  for (const model of Object.values(models)) monaco.editor.setModelMarkers(model, "runtime", []);
  status.textContent = "";
  clearLines(consoleLines);
  log([{ level: "log", text: runStartLine(lessonIndex, project?.name), count: 1 }]);
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
    post({ type: "key", code: e.code, down: e.type === "keydown" });
  };
  // Leaving the game pauses it, so no Goals or Lose events happen while the student isn't playing.
  canvas.onblur = () => {
    if (!running) return;
    post({ type: "pause" });
    stopSounds();
    showOverlay("Click to play", false);
  };
  canvas.onfocus = () => {
    if (!running) return;
    paused = false;
    post({ type: "resume" });
    showOverlay("", false);
  };

  if (v2) unlockAudio(); // run() only ever follows a click or Ctrl+Enter, which may start audio
  const offscreen = canvas.transferControlToOffscreen();
  worker = new RunnerWorker();
  stopBtn.hidden = false;
  runBtn.hidden = true;
  running = true;
  paused = false;
  canvas.focus();
  post({ type: "start", canvas: offscreen, ...(project ? { level: project.level } : { lesson: lessonIndex }), earned: [...earned], scripts: Object.fromEntries(Object.entries(models).map(([n, m]) => [n, transpile(m.getValue())])) }, [offscreen]);

  let lastTick = performance.now();
  worker.onmessage = (e: MessageEvent<FromWorker>) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "paused") paused = e.data.paused;
    if (e.data.type === "logs") log(e.data.lines);
    if (e.data.type === "achievements") earn(e.data.ids);
    if (e.data.type === "sounds" && !muted) playClips(e.data.names);
    if (e.data.type === "labels") showLabels(e.data.labels);
    if (e.data.type === "check") {
      showGoals(e.data.met);
      if (e.data.lost || e.data.passed) ended(); // the worker stopped its loop on purpose
      if (e.data.lost) showOverlay(e.data.lost, true);
      if (e.data.passed) {
        const wasUnlocked = sandboxUnlocked(course);
        markPassed(lesson.title);
        saveSnapshot(lesson.title, Object.fromEntries(Object.entries(models).map(([n, m]) => [n, m.getValue()])));
        showProgress();
        showOverlay("✓ Lesson passed", false, true);
        toast("Lesson passed");
        if (!wasUnlocked && sandboxUnlocked(course)) {
          toast("🔓 Sandbox unlocked");
          setTimeout(() => {
            openMenu("course");
            setMode("sandbox");
          }, 1500);
        }
      }
    }
    if (e.data.type === "error") {
      ended(); // the worker already stopped its loop; terminating now would blank the last frame
      const where = e.data.script && e.data.line ? `${e.data.script}.ts:${e.data.line} ` : "";
      log([{ level: "error", text: `${where}${e.data.message}`, count: 1 }]);
      const model = e.data.script && models[e.data.script];
      if (model && e.data.line) {
        show(e.data.script!);
        monaco.editor.setModelMarkers(model, "runtime", [{
          severity: monaco.MarkerSeverity.Error,
          message: e.data.message,
          startLineNumber: e.data.line,
          startColumn: e.data.col ?? 1,
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
    lesson: project ? undefined : {
      title: lesson.title,
      explanation: lesson.explanation,
      goals: goals.map((g, i) => ({ message: g.message, met: !!goalsMet[i] })),
      hints: hints.slice(0, opened),
    },
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
