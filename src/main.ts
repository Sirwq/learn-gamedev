import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import { modKey, runShortcut, runStartLine, transpile } from "./run-utils";
import { FONT_MAX, FONT_MIN, savedFontSize, zoom, zoomPercent } from "./zoom";
import { marked } from "marked";
import { course } from "./lessons/course";
import { loadScripts, loadSnapshot, openedHints, restoreStash, saveOpenedHints, saveScript, saveSnapshot, snapshot } from "./lesson";
import { cardStates, currentLesson, markPassed, progress, referenceFor, unlocked } from "./check";
import { addLine, clearLines, type ConsoleLine, lineText } from "./console";
import engineApi from "./engine-api.d.ts?raw";
import { anchor, docLink, docPages } from "./docs";
import { tutorPrompt } from "./lessons/ai-note";
import { achievements, loadEarned, saveEarned, stateOf } from "./achievements";
import { type Box, Camera, GameObject, Vector2 } from "./engine";
import { drawWorld, loadImages } from "./sprites";
import { swipeStep } from "./swipe";
import { createProject, deleteProject, duplicateProject, loadProjects, type Project, sandboxUnlocked, saveProject, scriptNameError, scriptStub } from "./sandbox";

self.MonacoEnvironment = {
  getWorker: (_, label) => (label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker()),
};

monaco.typescript.typescriptDefaults.addExtraLib(engineApi, "file:///engine-api.d.ts");

// The Course menu picks a Lesson by reloading with ?lesson=N, a Sandbox Project with ?sandbox=id;
// without either the app opens on the menu, over the current Lesson (?sandbox with no Project: on the Sandbox menu).
const params = new URLSearchParams(location.search);
const asked = params.get("lesson");
const askedProject = sandboxUnlocked(course) ? params.get("sandbox") : null;
const project: Project | undefined = loadProjects().find((p) => p.id === askedProject);
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

// Course menu: a cover carousel, one card per Lesson. Once unlocked, a Sandbox tab: one card per Project, then "+ New".
const menu = document.getElementById("menu")!;
const rail = document.getElementById("rail")!;
const replayBox = document.getElementById("replay") as HTMLDialogElement;
const newBox = document.getElementById("new-project") as HTMLDialogElement;
const chipCourse = document.getElementById("chip-course")!;
const chipSandbox = document.getElementById("chip-sandbox")!;
const prevBtn = document.getElementById("menu-prev") as HTMLButtonElement;
const nextBtn = document.getElementById("menu-next") as HTMLButtonElement;
const dots = document.getElementById("menu-dots")!;
let mode: "course" | "sandbox" = "course";
let focused = lessonIndex;
let states = cardStates(course);
let menuCurrent = current; // moves on when a Lesson is passed on this page
let projects: Project[] = [];
function coverCard(small: string, title: string, i: number) {
  const card = document.createElement("button");
  card.tabIndex = -1; // ← → move between cards
  card.innerHTML = `<canvas width="240" height="320"></canvas><span class="tag"></span><span class="name"><small></small></span>`;
  card.querySelector("small")!.textContent = small;
  card.querySelector(".name")!.append(title); // Project names are the student's own text
  card.onclick = () => (i === focused ? pick(i) : focusCard(i));
  return card;
}
const courseCards = course.map((l, i) => coverCard(`LESSON ${i + 1}`, l.title.replace(/^\d+\.\s*/, ""), i));
let projectCards: HTMLButtonElement[] = [];
const cards = () => (mode === "course" ? courseCards : projectCards);
const coverOf = (i: number) => cards()[i].querySelector("canvas")!;
const menuBg = document.getElementById("menu-bg") as HTMLCanvasElement;
const drawBg = () => menuBg.getContext("2d")!.drawImage(coverOf(focused), 0, 0);
const images = loadImages();
// Cover art: the Level in the game's pixel style, zoomed in around the Player and what's ahead of it (the start view without one).
function drawCover(canvas: HTMLCanvasElement, boxes: Box[]) {
  images.then((imgs) => {
    const objects = boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y)));
    const p = boxes.find((b) => b.tag === "Player");
    const size = 180;
    drawWorld(canvas.getContext("2d")!, imgs, p ? new Camera({ x: p.x + 90, y: Math.max(size, p.y + p.h / 2), size }) : new Camera(), objects);
    drawBg();
  });
}
course.forEach((l, i) => drawCover(courseCards[i].querySelector("canvas")!, l.level.boxes));
// Before the first Run the game shows the Level as it starts; Run swaps in a fresh canvas for the worker.
const startLevel = project ? project.level : course[lessonIndex].level;
images.then((imgs) => drawWorld((document.getElementById("game") as HTMLCanvasElement).getContext("2d")!, imgs, new Camera(startLevel.camera),
  startLevel.boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y)))));
function buildProjectCards() {
  projects = loadProjects();
  projectCards = [...projects.map((p, i) => coverCard("PROJECT", p.name, i)), coverCard("", "+ New", projects.length)];
  projects.forEach((p, i) => drawCover(projectCards[i].querySelector("canvas")!, p.level.boxes));
  drawCover(projectCards[projects.length].querySelector("canvas")!, []);
}

// Tiny status icons: decoration only, the pill's words carry the meaning.
const icon = (d: string) => `<svg aria-hidden="true" viewBox="0 0 12 12" width="10" height="10">${d}</svg>`;
const CHECK = icon(`<path d="M2 6.5 5 9.5 10 3" fill="none" stroke="currentColor" stroke-width="2"/>`);
const PLAY = icon(`<path d="M3 1.5v9l7.5-4.5z" fill="currentColor"/>`);
const LOCK = icon(`<rect x="2" y="5.5" width="8" height="6" rx="1" fill="currentColor"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`);
/** The same padlock, big, in a round badge in the middle of a locked cover. */
const LOCK_BADGE = `<span class="lock"><svg aria-hidden="true" viewBox="0 0 24 24" width="34" height="34"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="15.5" r="1.6" fill="#1b1d24"/></svg></span>`;
const playLabel = (i: number) =>
  mode === "sandbox" ? (i === projects.length ? "Create" : "Open")
  : states[i] === "locked" ? "How to unlock" : states[i] === "passed" && i !== menuCurrent ? "Replay" : "Play";
function layoutMenu() {
  const list = cards();
  list.forEach((card, i) => {
    const d = i - focused;
    card.style.cssText = `--d:${d};--s:${Math.sign(d)}`; // CSS places and sizes the card
    card.ariaCurrent = dots.children[i].ariaCurrent = d ? null : "true";
    (dots.children[i] as HTMLElement).tabIndex = d ? -1 : 0; // one Tab stop for the dots; ← → move along them
    dots.children[i].className = mode === "course" ? states[i] : "";
    if (mode === "sandbox") {
      card.className = i < projects.length ? "cover" : "cover new";
      card.ariaLabel = i < projects.length ? `Project ${projects[i].name}` : "New Project";
      card.querySelector(".tag")!.textContent = projects[i] && projects[i].id === project?.id ? "▶ open" : "";
      return;
    }
    card.className = `cover ${states[i]}`;
    card.ariaLabel = `${course[i].title}, ${{ passed: "passed", current: "up next", locked: "locked" }[states[i]]}`;
    const tag = card.querySelector(".tag")!;
    if (states[i] === "locked") tag.innerHTML = LOCK_BADGE; // our own markup
    else tag.textContent = { passed: "✓ passed", current: "▶ next" }[states[i]];
  });
  drawBg();
  const meta = document.getElementById("card-meta")!;
  const line = (cls: string, html: string) => `<div class="${cls}">${html}</div>`;
  const files = (names: string[]) => line("meta-files", `Code in ${names.map((n) => `<code translate="no">${n.replace(/[&<]/g, (c) => (c === "&" ? "&amp;" : "&lt;"))}.ts</code>`).join(", ")}`);
  let title;
  if (mode === "sandbox") {
    const p = projects[focused];
    title = p ? p.name : "New Project";
    meta.innerHTML = p ? files(Object.keys(p.scripts)) : line("meta-concept", "Blank, or My platformer: a copy of your Course code");
  } else {
    const scripts = [...new Set(course.slice(0, focused + 1).flatMap((l) => Object.keys(l.scripts)))];
    const state = { passed: [CHECK, "Passed"], current: [PLAY, "Up next"], locked: [LOCK, `Pass Lesson ${menuCurrent + 1} to unlock`] }[states[focused]];
    // Code words in the concept (Update(), Time.deltaTime, if, &&) get the inline-code look; "Script:" is a plain word.
    const concept = course[focused].concept.replace(/else if|&&|\b(?:if|for)\b|[A-Z]\w*(?:\.\w+)*(?:\(\))?(?!:)/g, (c) => `<code translate="no">${c.replaceAll("&", "&amp;")}</code>`);
    title = course[focused].title;
    meta.innerHTML = line("meta-concept", `<span class="pill ${states[focused]}">${state[0]}${state[1]}</span> ${concept}`) + files(scripts);
  }
  document.getElementById("card-title")!.textContent = title;
  prevBtn.disabled = focused === 0;
  nextBtn.disabled = focused === list.length - 1;
  if ((document.activeElement as HTMLButtonElement).disabled) menu.focus(); // a disabled button drops focus to <body>
  document.getElementById("menu-play")!.querySelector("b")!.textContent = playLabel(focused);
  const passed = states.filter((s) => s === "passed").length;
  document.getElementById("menu-stats")!.innerHTML =
    `<span aria-hidden="true">🏆 ${earned.size} / ${achievements.length}   ✓ ${passed} / ${course.length} passed</span>` +
    `<span class="sr-only">${earned.size} of ${achievements.length} Achievements, ${passed} of ${course.length} Lessons passed</span>`;
}
const menuLive = document.getElementById("menu-live")!;
const announce = () =>
  (menuLive.textContent = `${cards()[focused].ariaLabel}, ${mode === "course" ? "Lesson " : ""}${focused + 1} of ${cards().length}`);
function focusCard(i: number) {
  focused = Math.max(0, Math.min(cards().length - 1, i));
  layoutMenu();
  announce();
  if (dots.contains(document.activeElement)) (dots.children[focused] as HTMLElement).focus();
}
function showMode(m: typeof mode) {
  mode = m;
  if (m === "sandbox") buildProjectCards();
  focused = m === "course" ? lessonIndex : Math.max(0, projects.findIndex((p) => p.id === project?.id));
  rail.replaceChildren(...cards());
  const noun = m === "course" ? "Lesson" : "Project";
  dots.ariaLabel = `${noun}s`;
  prevBtn.ariaLabel = `Previous ${noun}`;
  nextBtn.ariaLabel = `Next ${noun}`;
  dots.replaceChildren(...cards().map((_, i) => {
    const dot = document.createElement("button");
    dot.ariaLabel = m === "course" ? course[i].title : projects[i]?.name ?? "New Project";
    dot.onclick = () => focusCard(i);
    return dot;
  }));
  for (const [chip, on] of [[chipCourse, m === "course"], [chipSandbox, m === "sandbox"]] as const) {
    chip.classList.toggle("on", on);
    chip.ariaPressed = String(on);
  }
  document.getElementById("menu-heading")!.textContent = m === "course" ? "Choose a Lesson" : "Choose a Project";
  document.title = `${m === "course" ? "Lessons" : "Projects"} · learn-dev`;
  layoutMenu();
  announce();
}
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
/** Switches tab with the whole menu sliding sideways: Sandbox sits to the right of TypeScript. */
function setMode(m: typeof mode) {
  if (m === mode) return;
  showMode(m);
  if (reduceMotion.matches) return;
  for (const el of [rail, document.getElementById("card-info")!, menuBg]) {
    for (const a of el.getAnimations()) a.cancel(); // a quick Q E Q doesn't stack slides
    el.animate([{ transform: `translateX(${m === "sandbox" ? "" : "-"}100%)` }, { transform: "none" }], { duration: 350, easing: "ease-out" });
  }
}
const startMode = project || askedProject !== null ? "sandbox" : "course";
// While the menu is open the page behind it is out of reach: Tab stays in the menu.
const behind = [document.querySelector("body > header")!, document.querySelector("main")!] as HTMLElement[];
let opener: Element | null = null;
function openMenu(m: typeof mode = startMode) {
  if (menu.hidden) opener = document.activeElement;
  for (const el of behind) el.inert = true;
  states = cardStates(course);
  menuCurrent = currentLesson(course);
  chipSandbox.hidden = !sandboxUnlocked(course);
  menu.hidden = false;
  showMode(m);
  menu.focus();
}
function closeMenu() {
  menu.hidden = true;
  for (const el of behind) el.inert = false;
  document.title = `${lessonTitle.textContent} · learn-dev`;
  if (opener instanceof HTMLElement && opener !== document.body) opener.focus();
  else editor.focus();
}
const go = (i: number) => (location.search = `?lesson=${i}`);
function pick(i: number) {
  if (mode === "sandbox") {
    if (i === projects.length) return newBox.showModal();
    if (projects[i].id === project?.id) return closeMenu();
    return void (location.search = `?sandbox=${projects[i].id}`);
  }
  if (states[i] === "locked") return void toast(`Pass Lesson ${menuCurrent + 1} to unlock`);
  if (i === lessonIndex && !project) return closeMenu();
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
document.getElementById("new-cancel")!.onclick = () => newBox.close();
const create = (kind: "blank" | "platformer") => () => (location.search = `?sandbox=${createProject(kind, course).id}`);
document.getElementById("new-blank")!.onclick = create("blank");
document.getElementById("new-platformer")!.onclick = create("platformer");
replayBox.onclose = newBox.onclose = () => menu.focus();
replayBox.onkeydown = newBox.onkeydown = (e) => {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  e.preventDefault();
  const options = Array.from((e.currentTarget as HTMLDialogElement).querySelectorAll("button"));
  const k = options.indexOf(document.activeElement as HTMLButtonElement);
  options[(k + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].focus();
};
chipCourse.onclick = () => setMode("course");
chipSandbox.onclick = () => setMode("sandbox");
const menuKeys: Record<string, () => void> = {
  ArrowLeft: () => focusCard(focused - 1),
  ArrowRight: () => focusCard(focused + 1),
  Escape: closeMenu,
  KeyA: () => trophies.click(),
  KeyQ: () => (chipSandbox.hidden ? toast("TypeScript is the only Course for now. C# comes later.") : setMode("course")),
  KeyE: () => (chipSandbox.hidden ? toast("Sandbox opens when you finish the Course") : setMode("sandbox")),
};
document.addEventListener("keydown", (e) => {
  if (menu.hidden || !map.hidden || replayBox.open || newBox.open || map.contains(e.target as Node)) return;
  // Enter on a focused button clicks it; on the menu itself it plays the focused card.
  const key = menuKeys[e.code] ?? (e.code === "Enter" && e.target === menu ? () => pick(focused) : undefined);
  if (!key) return;
  e.preventDefault();
  key();
});
const menuBack = document.getElementById("menu-back")!;
menuBack.onclick = closeMenu;
menuBack.ariaLabel = menuBack.title = project ? "Back to Project" : `Back to Lesson ${lessonIndex + 1}`;
menuBack.lastChild!.textContent = ` ${menuBack.ariaLabel}`;
const phoneNote = document.getElementById("menu-phone")!;
phoneNote.querySelector("button")!.onclick = () => (phoneNote.remove(), menu.focus());
const menuOpen = document.getElementById("menu-open")!;
if (project) {
  menuOpen.ariaLabel = menuOpen.title = "Back to Projects";
  menuOpen.lastChild!.textContent = " Back to Projects";
}
document.getElementById("menu-achievements")!.onclick = () => trophies.click();
document.getElementById("menu-play")!.onclick = () => pick(focused);
prevBtn.onclick = () => focusCard(focused - 1);
nextBtn.onclick = () => focusCard(focused + 1);
// One wheel or trackpad gesture moves one card: the next move waits until the wheel has been still for 200 ms.
let wheelQuiet = 0;
menu.addEventListener("wheel", (e) => {
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (!wheelQuiet && d) focusCard(focused + Math.sign(d));
  clearTimeout(wheelQuiet);
  wheelQuiet = setTimeout(() => (wheelQuiet = 0), 200);
}, { passive: true });
let touchStart: Touch | undefined;
rail.addEventListener("touchstart", (e) => (touchStart = e.touches.length === 1 ? e.touches[0] : undefined), { passive: true });
rail.addEventListener("touchend", (e) => {
  const end = e.changedTouches[0];
  const step = touchStart ? swipeStep(end.clientX - touchStart.clientX, end.clientY - touchStart.clientY) : 0;
  if (!step) return;
  e.preventDefault(); // no click on the card the swipe started on
  focusCard(focused + step);
});
menuOpen.onclick = document.getElementById("progress")!.onclick = () => openMenu();
if (asked === null && !project) openMenu(); // the app opens on the Course menu (or the Sandbox menu for ?sandbox)

// The Lesson strip of a Project: its name, Rename / Duplicate / Delete.
if (project) {
  document.getElementById("project-actions")!.hidden = false;
  document.getElementById("rename")!.onclick = () => {
    const name = prompt("Project name:", project.name)?.trim();
    if (!name) return;
    project.name = lessonTitle.textContent = name;
    saveProject(project);
  };
  document.getElementById("duplicate")!.onclick = () => (location.search = `?sandbox=${duplicateProject(project).id}`);
  document.getElementById("delete")!.onclick = () => {
    if (!confirm(`Delete "${project.name}"? Its Scripts are gone for good.`)) return;
    deleteProject(project.id);
    location.search = "?sandbox";
  };
}

// The Reference model is JavaScript so the TS project never sees a second `class Player`; its diagnostics are off.
monaco.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: true });
const compare = document.getElementById("compare")!;
const diff = monaco.editor.createDiffEditor(document.getElementById("diff")!, {
  theme: "page", readOnly: true, wordWrap: "on", automaticLayout: true,
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

let worker: Worker | undefined;
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
  runBtn.hidden = true;
  running = true;
  paused = false;
  canvas.focus();
  worker.postMessage({ canvas: offscreen, ...(project ? { level: project.level } : { lesson: lessonIndex }), earned: [...earned], scripts: Object.fromEntries(Object.entries(models).map(([n, m]) => [n, transpile(m.getValue())])) }, [offscreen]);

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
