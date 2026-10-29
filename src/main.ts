import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import { transpile } from "./run-utils";
import { marked } from "marked";
import { course } from "./lessons/course";
import { loadScripts, loadSnapshot, openedHints, restoreStash, saveOpenedHints, saveScript, saveSnapshot, snapshot } from "./lesson";
import { cardStates, currentLesson, markPassed, progress, referenceFor, unlocked } from "./check";
import { addLine, clearLines, type ConsoleLine, lineText } from "./console";
import engineApi from "./engine-api.d.ts?raw";
import { anchor, docLink, docPages } from "./docs";
import { tutorPrompt } from "./lessons/ai-note";
import { achievements, loadEarned, saveEarned, stateOf } from "./achievements";
import { Camera, GameObject, Vector2 } from "./engine";
import { drawWorld, loadImages } from "./sprites";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(engineApi, "file:///engine-api.d.ts");

// The Course menu picks a Lesson by reloading with ?lesson=N; without it the app opens on the menu, over the current Lesson.
const asked = new URLSearchParams(location.search).get("lesson");
const current = currentLesson(course);
const lessonIndex = asked !== null && Number.isInteger(Number(asked)) && unlocked(course, Number(asked)) ? Number(asked) : current;
const replaying = lessonIndex !== current;
if (!replaying) restoreStash(); // before the editor loads the code
const lesson = course[lessonIndex];
document.getElementById("lesson-title")!.textContent = lesson.title;
document.getElementById("replaying")!.hidden = !replaying;
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
const nextIndex = replaying ? current : lessonIndex + 1;
if (nextIndex < course.length) {
  const next = document.createElement("button");
  next.id = "next";
  next.textContent = replaying ? `Back to Lesson ${current + 1}` : "Next Lesson ▶";
  next.onclick = () => (location.search = `?lesson=${nextIndex}`);
  passBox.append(next);
}

function toast(text: string) {
  const t = document.createElement("div");
  t.textContent = text;
  t.onanimationend = () => t.remove();
  document.getElementById("toasts")!.append(t);
  return t;
}

// Achievements: earned in the worker, saved and shown here.
const earned = loadEarned();
const trophies = document.getElementById("trophies")!;
const map = document.getElementById("achievements")!;
const showTrophies = () => (trophies.textContent = `🏆 ${earned.size} / ${achievements.length}`);
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
const centre = (a: (typeof achievements)[number]) => [a.col * CELL + CELL / 2, a.row * CELL + CELL / 2];
function drawMap() {
  map.querySelector("header span")!.textContent = `${earned.size} earned · gold = earned · grey = can earn now · ? = earn the one before it first`;
  const [w, h] = [13 * CELL, 9 * CELL];
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
    const tip = state === "hidden" ? "???\nEarn the one before it first" : `${a.title}\n${a.message}${state === "earned" ? "\n✓ earned" : ""}`;
    return `<i class="tile ${state}" style="left:${x}px;top:${y}px" title="${tip}" aria-label="${tip}">${state === "hidden" ? "?" : `<span>${a.icon}</span>`}</i>`;
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

// Course menu: a cover carousel, one card per Lesson.
const menu = document.getElementById("menu")!;
const rail = document.getElementById("rail")!;
const replayBox = document.getElementById("replay") as HTMLDialogElement;
let focused = lessonIndex;
let states = cardStates(course);
let menuCurrent = current; // moves on when a Lesson is passed on this page
const cards = course.map((l, i) => {
  const card = document.createElement("button");
  card.tabIndex = -1; // ← → move between cards
  card.innerHTML = `<canvas width="240" height="320"></canvas><span class="tag"></span><span class="name"><small>LESSON ${i + 1}</small>${l.title.replace(/^\d+\.\s*/, "")}</span>`; // our own titles
  card.onclick = () => (i === focused ? pick(i) : focusCard(i));
  return card;
});
rail.append(...cards);
const coverOf = (i: number) => cards[i].querySelector("canvas")!;
const menuBg = document.getElementById("menu-bg") as HTMLCanvasElement;
const drawBg = () => menuBg.getContext("2d")!.drawImage(coverOf(focused), 0, 0);
// Cover art: the Lesson's Level in the game's pixel style, zoomed in around the Player and what's ahead of it.
loadImages().then((images) => {
  course.forEach((l, i) => {
    const objects = l.level.boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y)));
    const p = l.level.boxes.find((b) => b.tag === "Player")!;
    const size = 180;
    drawWorld(coverOf(i).getContext("2d")!, images, new Camera({ x: p.x + 90, y: Math.max(size, p.y + p.h / 2), size }), objects);
  });
  drawBg();
});

const playLabel = (i: number) => (states[i] === "locked" ? "Locked" : states[i] === "passed" && i !== menuCurrent ? "Replay" : "Play");
function layoutMenu() {
  const W = rail.clientWidth, H = rail.clientHeight, gap = 22;
  const bigW = H * 0.75, smallH = H * 0.6, smallW = smallH * 0.75;
  cards.forEach((card, i) => {
    const d = i - focused;
    const [w, h] = d ? [smallW, smallH] : [bigW, H];
    const x = d === 0 ? W / 2 - w / 2 : d > 0 ? W / 2 + bigW / 2 + gap + (d - 1) * (smallW + gap) : W / 2 - bigW / 2 - gap - smallW + (d + 1) * (smallW + gap);
    card.style.cssText = `left:${x}px;top:${(H - h) / 2}px;width:${w}px;height:${h}px`;
    card.className = `cover ${states[i]}`;
    card.ariaCurrent = d ? null : "true";
    card.ariaLabel = `${course[i].title}, ${states[i]}`;
    card.querySelector(".tag")!.textContent = { passed: "✓ passed", current: "▶ next", locked: "🔒" }[states[i]];
  });
  drawBg();
  const scripts = [...new Set(course.slice(0, focused + 1).flatMap((l) => Object.keys(l.scripts)))].map((n) => `${n}.ts`);
  const state = { passed: "✓ Passed", current: "▶ Up next", locked: `🔒 Pass Lesson ${menuCurrent + 1} first` }[states[focused]];
  document.getElementById("card-title")!.textContent = course[focused].title;
  document.getElementById("card-meta")!.replaceChildren(...[`🧩 ${course[focused].concept}`, `📄 ${scripts.join(", ")}`, state].map((t) => {
    const span = document.createElement("span");
    span.textContent = t;
    return span;
  }));
  document.getElementById("menu-count")!.textContent = `${focused + 1} / ${course.length}`;
  document.getElementById("menu-play")!.querySelector("b")!.textContent = playLabel(focused);
  document.getElementById("menu-stats")!.textContent =
    `🏆 ${earned.size} / ${achievements.length}   ✓ ${states.filter((s) => s === "passed").length} / ${course.length} passed`;
}
function focusCard(i: number) {
  focused = Math.max(0, Math.min(course.length - 1, i));
  layoutMenu();
}
function openMenu() {
  states = cardStates(course);
  menuCurrent = currentLesson(course);
  focused = lessonIndex;
  menu.hidden = false;
  layoutMenu();
  menu.focus();
}
function closeMenu() {
  menu.hidden = true;
  editor.focus();
}
const go = (i: number) => (location.search = `?lesson=${i}`);
function pick(i: number) {
  if (states[i] === "locked") return void toast(`Pass Lesson ${menuCurrent + 1} first`);
  if (i === lessonIndex) return closeMenu();
  if (playLabel(i) === "Play" || !snapshot(course[i].title)) return go(i);
  replayBox.querySelector("h3")!.textContent = `Replay ${course[i].title}?`;
  replayBox.querySelector("#replay-load small")!.textContent =
    `Your editor goes back to the code you passed it with. Your newer code is saved and comes back when you return to Lesson ${menuCurrent + 1}.`;
  (replayBox.querySelector("#replay-keep") as HTMLButtonElement).onclick = () => go(i);
  (replayBox.querySelector("#replay-load") as HTMLButtonElement).onclick = () => {
    loadSnapshot(course[i].title);
    go(i);
  };
  replayBox.showModal();
}
document.getElementById("replay-cancel")!.onclick = () => replayBox.close();
replayBox.onclose = () => menu.focus();
replayBox.onkeydown = (e) => {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  e.preventDefault();
  const options = Array.from(replayBox.querySelectorAll("button"));
  const k = options.indexOf(document.activeElement as HTMLButtonElement);
  options[(k + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].focus();
};
const soon = () => toast("TypeScript is the only Course for now. C# comes later.");
const menuKeys: Record<string, () => void> = {
  ArrowLeft: () => focusCard(focused - 1),
  ArrowRight: () => focusCard(focused + 1),
  Escape: closeMenu,
  KeyA: () => trophies.click(),
  KeyQ: soon,
  KeyE: soon,
};
document.addEventListener("keydown", (e) => {
  if (menu.hidden || !map.hidden || replayBox.open || map.contains(e.target as Node)) return;
  // Enter on a focused button clicks it; on the menu itself it plays the focused card.
  const key = menuKeys[e.code] ?? (e.code === "Enter" && e.target === menu ? () => pick(focused) : undefined);
  if (!key) return;
  e.preventDefault();
  key();
});
document.getElementById("menu-back")!.onclick = closeMenu;
document.getElementById("menu-achievements")!.onclick = () => trophies.click();
document.getElementById("menu-play")!.onclick = () => pick(focused);
document.getElementById("menu-open")!.onclick = document.getElementById("progress")!.onclick = openMenu;
window.addEventListener("resize", () => menu.hidden || layoutMenu());
if (asked === null) openMenu(); // the app opens on the Course menu

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
  worker.postMessage({ canvas: offscreen, lesson: lessonIndex, earned: [...earned], scripts: Object.fromEntries(Object.entries(models).map(([n, m]) => [n, transpile(m.getValue())])) }, [offscreen]);

  let lastTick = performance.now();
  worker.onmessage = (e) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "paused") paused = e.data.paused;
    if (e.data.type === "logs") log(e.data.lines);
    if (e.data.type === "achievements") earn(e.data.ids);
    if (e.data.type === "check") {
      showGoals(e.data.met);
      if (e.data.lost || e.data.passed) ended(); // the worker stopped its loop on purpose
      if (e.data.lost) showOverlay(e.data.lost, true);
      if (e.data.passed) {
        markPassed(lesson.title);
        saveSnapshot(lesson.title, Object.fromEntries(Object.entries(models).map(([n, m]) => [n, m.getValue()])));
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
