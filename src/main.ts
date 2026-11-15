import * as monaco from "monaco-editor";
import { inject } from "@vercel/analytics";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import TsWorker from "monaco-editor/language/typescript/ts.worker.js?worker";
import RunnerWorker from "./runner.worker?worker";
import type { FromWorker, ToWorker } from "./runner-protocol";
import { codeErrorLines, modKey, runShortcut, runStartLine, transpile, v2Features, type CodeError } from "./run-utils";
import { loadMuted, playAchievementCue, playClips, saveMuted, stopSounds, unlockAudio } from "./sound";
import { drawLabels, loadFont, textList } from "./gui";
import type { Label } from "./engine";
import { FONT_MAX, FONT_MIN, savedFontSize, zoom, zoomPercent } from "./zoom";
import { marked } from "marked";
import { course } from "./lessons/course";
import { loadScripts, openedHints, restoreStash, saveOpenedHints, saveScript, saveSnapshot, snapshot } from "./lesson";
import { CHAPTER_ONE_COUNT, CHAPTER_TWO_COUNT, chapterProgress, currentLesson, markPassed, progress, referenceFor, unlocked } from "./check";
import { addLine, clearLines, type ConsoleLine, lineText } from "./console";
import engineApi from "./engine-api.d.ts?raw";
import { anchor, docLink, docPageAvailable, docPages } from "./docs";
import { tutorPrompt } from "./lessons/ai-note";
import { askDeepSeek } from "./lessons/deepseek";
import { achievements, loadEarned, saveEarned, stateOf } from "./achievements";
import { Camera, GameObject, Vector2 } from "./engine";
import { drawWorld, loadImages, ownSprites } from "./sprites";
import { courseMenu } from "./menu";
import { levelView } from "./level-view";
import { objectInspector } from "./object-inspector";
import { startingObjects } from "./object-snapshots";
import { achievementToast, toast } from "./toast";
import { download } from "./backup";
import { addScript, type Project, sandboxUnlocked } from "./sandbox";
import { createProject, deleteProject, duplicateProject, exportProject, flushProjectWrites, loadProject, loadProjects, migrateProjects, saveProjectWithImages } from "./project-storage";
import { exportGame } from "./game-export";
import { claimProjectEditor } from "./project-lock";
import { saveState } from "./save-state";
import { exportFileName } from "./project-file";
import { formatCode } from "./format-code";
import { activeCatalog, catalogs, escapeHtml, localizeAchievement, localizeCheck, localizeDocs, localizeLesson, localizeRuntimeError, t, translateStatic } from "./i18n";

inject();
translateStatic();
if (Object.keys(catalogs).length > 1) {
  const makePicker = (id: string) => {
    const picker = document.createElement("select");
    picker.id = id;
    picker.className = "language-picker";
    picker.ariaLabel = t("Language");
    picker.add(new Option("English", "en"));
    picker.add(new Option("Русский", "ru"));
    picker.value = activeCatalog.locale;
    picker.onchange = async () => {
      picker.disabled = true;
      try { await flushProjectWrites(); }
      catch {
        picker.disabled = false;
        picker.value = activeCatalog.locale;
        toast(t("Storage is full: your last Project change was not saved. Delete a Project you no longer need and try again."));
        return;
      }
      const menu = document.getElementById("menu")!;
      const dots = Array.from(menu.querySelectorAll("#menu-dots button"));
      sessionStorage.setItem("locale:view", JSON.stringify({
        menu: !menu.hidden,
        mode: document.getElementById("chip-sandbox")?.getAttribute("aria-pressed") === "true" ? "sandbox" : "course",
        card: dots.findIndex((dot) => dot.hasAttribute("aria-current")),
        tab: document.querySelector("#tabs [aria-selected='true']")?.getAttribute("data-key"),
        docsPage: document.querySelector("#docs nav [aria-current='page']")?.getAttribute("data-page"),
        objects: document.getElementById("show-objects")?.getAttribute("aria-pressed") === "true",
        focus: id,
      }));
      localStorage.setItem("locale", picker.value);
      location.reload();
    };
    return picker;
  };
  document.getElementById("theme")!.before(makePicker("language-header"));
  document.getElementById("menu-saves")!.before(makePicker("language-menu"));
}

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
  if (e.reason?.name === "QuotaExceededError") toast(t("Storage is full: your last Project change was not saved. Delete a Project you no longer need and try again."));
});
await migrateProjects();
const projects = await loadProjects();
const canEditProject = askedProject ? await claimProjectEditor(askedProject, navigator.locks) : false;
if (askedProject && !canEditProject) toast(t("This Project cannot be edited here. Close its other tab and reopen it in a browser with Web Locks support."));
const projectData = canEditProject ? await loadProject(askedProject!) : undefined;
const project: Project | undefined = projectData?.project;
let projectImages = projectData?.images ?? {};
const saveButton = document.getElementById("save-state") as HTMLButtonElement;
const saves = saveState((state) => {
  saveButton.textContent = state === "saving" ? t("Saving…") : state === "saved" ? t("Saved on this device") : t("Save failed — click to retry");
});
const saveCurrentProject = () => project ? saves.track(saveProjectWithImages(project, projectImages)) : Promise.resolve(true);
saveButton.onclick = () => { void saveCurrentProject(); };
window.addEventListener("beforeunload", (event) => {
  if (saves.dirty) { event.preventDefault(); event.returnValue = ""; }
});
const current = currentLesson(course);
const lessonIndex = asked !== null && Number.isInteger(Number(asked)) && unlocked(course, Number(asked)) ? Number(asked) : current;
const replaying = !project && lessonIndex !== current;
if (!replaying && !project) restoreStash(); // before the editor loads the code
const lesson = course[lessonIndex];
const displayLesson = localizeLesson(lesson);
const lessonTitle = document.getElementById("lesson-title")!;
lessonTitle.textContent = project ? project.name : displayLesson.title;
document.title = `${lessonTitle.textContent} · learn-dev`;
document.getElementById("replaying")!.hidden = !replaying;
document.getElementById("code-origin")!.hidden = !!project || lessonIndex === 0;
document.getElementById("final-project")!.hidden = !project;
const explanation = document.getElementById("explanation")!;
if (!project) explanation.innerHTML = marked.parse(displayLesson.explanation, { async: false }); // our own trusted Markdown
else explanation.textContent = t("This Project uses the saved Level and your Scripts. Open Objects to inspect the current game, or 🗺 Level to edit the starting boxes.");
const pages = docPages(engineApi, true);
// API names in the Explanation link to their Docs member.
for (const code of Array.from(explanation.querySelectorAll(":not(pre) > code"))) {
  const id = docLink(pages, code.textContent!);
  if (!id) continue;
  const a = document.createElement("a");
  a.href = `#${anchor(id)}`;
  code.replaceWith(a);
  a.append(code);
}

const hints = project ? [] : (displayLesson.hints ?? []);
const stillStuck = document.getElementById("still-stuck")!;
const nextHint = document.getElementById("next-hint") as HTMLButtonElement;
function showHints(opened: number) {
  document.getElementById("hints")!.replaceChildren(...hints.slice(0, opened).map((hint, i) => {
    const div = document.createElement("div");
    div.innerHTML = marked.parse(`**💡 ${t("Hint {number}", { number: i + 1 })}**\n\n${hint}`, { async: false });
    return div;
  }));
  nextHint.textContent = `💡 ${t("Hint {number} of {total}", { number: opened + 1, total: hints.length })}`;
  nextHint.ariaLabel = t("Hint {number} of {total}", { number: opened + 1, total: hints.length });
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
  const chapters = chapterProgress(course);
  const label = document.createElement("span");
  label.textContent = lessonIndex >= CHAPTER_ONE_COUNT && !project
    ? t("Ch. 2 {done} / {total}", { done: chapters.chapterTwo, total: CHAPTER_TWO_COUNT })
    : `${chapters.chapterOne} / ${CHAPTER_ONE_COUNT}`;
  const button = document.getElementById("progress")!;
  button.ariaLabel = t("{progress} Lessons passed, back to Lessons", { progress: label.textContent ?? "" });
  button.replaceChildren(...done.map((d, i) => {
    if (i >= CHAPTER_ONE_COUNT && !chapters.unlocked) return null;
    const pip = document.createElement("i");
    pip.className = d ? "done" : "";
    pip.title = localizeLesson(course[i]).title;
    pip.ariaHidden = "true";
    return pip;
  }).filter((pip) => pip !== null), label);
}
showProgress();

// One Monaco model per Script: models share one TS project, so each file type-checks against the others.
// A Project keeps its own copy of the code, so Sandbox and Course never write to each other.
const models: Record<string, monaco.editor.ITextModel> = {};
const codeErrorsShown = new Set<string>();
function addModel(name: string, code: string) {
  const model = (models[name] = monaco.editor.createModel(code, "typescript", monaco.Uri.parse(`file:///${name}.ts`)));
  model.onDidChangeContent(() => {
    monaco.editor.setModelMarkers(model, "runtime", []);
    if (codeErrorsShown.size) {
      for (let i = consoleLines.length - 1; i >= 0; i--)
        if (codeErrorsShown.has(consoleLines[i].text)) consoleLines.splice(i, 1);
      codeErrorsShown.clear();
      log([]);
    }
    if (!project) return saveScript(name, model.getValue());
    project.scripts[name] = model.getValue();
    void saveCurrentProject();
  });
}
for (const [name, code] of Object.entries(project?.scripts ?? loadScripts(course, lessonIndex))) addModel(name, code);
// The default editor palette follows the page; the other two stay independent of it.
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
const root = document.documentElement;
const paletteSelect = document.getElementById("editor-palette") as HTMLSelectElement;
const savedPalette = localStorage.getItem("editor:palette");
paletteSelect.value = [...paletteSelect.options].some((option) => option.value === savedPalette) ? savedPalette! : "page";
monaco.editor.defineTheme("midnight", {
  base: "vs-dark", inherit: true, rules: [],
  colors: {
    "editor.background": "#101827", "editor.foreground": "#e5edf7",
    "editorLineNumber.foreground": "#8796aa", "editorLineNumber.activeForeground": "#e5edf7",
    "editor.lineHighlightBackground": "#1c2a3d", "editor.selectionBackground": "#315679",
    "editor.inactiveSelectionBackground": "#24425e", "editorCursor.foreground": "#77e0c4",
    "editorError.foreground": "#ff8b86", "editorWarning.foreground": "#f2c879",
    "diffEditor.insertedTextBackground": "#28734a66", "diffEditor.removedTextBackground": "#b34d5766",
    "focusBorder": "#77e0c4",
  },
});
monaco.editor.defineTheme("paper", {
  base: "vs", inherit: true, rules: [],
  colors: {
    "editor.background": "#fff8ec", "editor.foreground": "#282736",
    "editorLineNumber.foreground": "#716a67", "editorLineNumber.activeForeground": "#282736",
    "editor.lineHighlightBackground": "#f2e8d6", "editor.selectionBackground": "#b9d6f0",
    "editor.inactiveSelectionBackground": "#dce8ee", "editorCursor.foreground": "#174d7a",
    "editorError.foreground": "#b42318", "editorWarning.foreground": "#8a5900",
    "diffEditor.insertedTextBackground": "#66b37955", "diffEditor.removedTextBackground": "#d2757555",
    "focusBorder": "#0a6f99",
  },
});
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
  monaco.editor.setTheme(paletteSelect.value);
  themeButton.textContent = light ? "☾" : "☀";
  themeButton.title = themeButton.ariaLabel = light ? t("Switch to dark theme") : t("Switch to light theme");
}
const themeButton = document.getElementById("theme")!;
paletteSelect.onchange = () => {
  try { localStorage.setItem("editor:palette", paletteSelect.value); } catch {}
  applyTheme();
};
themeButton.onclick = () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  applyTheme();
};
applyTheme();
const editor = monaco.editor.create(document.getElementById("editor")!, {
  automaticLayout: true,
  minimap: { enabled: false },
  ariaLabel: t("Code editor. Press Escape, then Tab to leave it."),
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
  tab.dataset.key = label;
  tab.textContent = label === "📖 Docs" ? `📖 ${t("Docs")}` : label === LEVEL ? `🗺 ${t("Level")}` : label;
  if (label === "📖 Docs") tab.ariaLabel = t("Docs");
  if (label === LEVEL) tab.ariaLabel = t("Level");
  tab.onclick = () => (label === "📖 Docs" ? openDocs() : label === LEVEL ? openLevel() : show(label.slice(0, -3)));
  return tab;
}
const LEVEL = "🗺 Level";
const tabs = [...(project ? [LEVEL] : []), ...Object.keys(models).map((name) => `${name}.ts`), "📖 Docs"].map(makeTab);
document.getElementById("tabs")!.append(...tabs);
if (project) {
  const addScript = document.createElement("button");
  addScript.textContent = t("+ Script");
  addScript.title = t("Add a new Script file");
  addScript.onclick = () => {
    const name = prompt(t("Name of the new Script (its class name, like Coin):"))?.trim();
    if (!name) return;
    const error = newScript(name);
    if (error) return void toast(error);
    show(name);
  };
  document.getElementById("tabs")!.append(addScript);
}
/** A new Script with its stub, saved, with its own file tab before Docs; returns what is wrong with the name, or "". */
function newScript(name: string) {
  const error = addScript(project!, name);
  if (error) return error;
  addModel(name, project!.scripts[name]);
  void saveCurrentProject();
  const tab = makeTab(`${name}.ts`);
  tabs.splice(tabs.length - 1, 0, tab);
  tabs[tabs.length - 1].before(tab);
  return "";
}
const selectTab = (label: string) => {
  for (const tab of tabs) tab.ariaSelected = String(tab.dataset.key === label);
};
const editorEl = document.getElementById("editor")!;
const docsEl = document.getElementById("docs")!;
let openScript = ""; // stays the last one shown while Docs, Compare or the Level is open
let level: ReturnType<typeof levelView> | undefined; // a Project's Level editor
function show(name: string) {
  openScript = name;
  level?.setOpen(false);
  editor.setModel(models[name]);
  editorEl.hidden = false;
  formatButton.hidden = false;
  docsEl.hidden = true;
  selectTab(`${name}.ts`);
}

// Docs tab: one page at a time; `#doc-…` links anywhere open the page holding that member.
const docsArticle = docsEl.querySelector("article")!;
const docsNav = pages.map((page) => {
  const b = document.createElement("button");
  b.dataset.page = page.title;
  b.textContent = page.title === "Sandbox" ? t("Sandbox") : page.title === "TypeScript vs Unity C#" ? t("TypeScript vs Unity C#") : page.title;
  b.hidden = !docPageAvailable(page.title, sandboxUnlocked(course));
  b.onclick = () => openDocs(page.title);
  return b;
});
docsEl.querySelector("nav")!.append(...docsNav);
let docsPage = pages[0].title;
function openDocs(target = docsPage) {
  if (!docPageAvailable(target, sandboxUnlocked(course))) return;
  const page = pages.find((p) => p.title === target || p.ids.includes(target))!;
  if (page.title !== docsPage || !docsArticle.hasChildNodes()) {
    docsPage = page.title;
    docsArticle.innerHTML = marked.parse(localizeDocs(page.title, page.markdown), { async: false }); // generated from our own typings
    docsArticle.scrollTop = 0;
    for (const b of docsNav) b.ariaCurrent = b.dataset.page === page.title ? "page" : null;
  }
  level?.setOpen(false);
  editorEl.hidden = true;
  formatButton.hidden = true;
  docsEl.hidden = false;
  selectTab("📖 Docs");
  if (target !== page.title) document.getElementById(anchor(target))?.scrollIntoView();
}
function refreshDocs() {
  const unlocked = sandboxUnlocked(course);
  docsNav.find((b) => b.dataset.page === "Sandbox")!.hidden = !docPageAvailable("Sandbox", unlocked);
  if (!unlocked && docsPage === "Sandbox") openDocs(pages[0].title);
}
function openLevel() {
  editorEl.hidden = docsEl.hidden = true;
  formatButton.hidden = true;
  selectTab(LEVEL);
  level!.setOpen(true);
}
const formatButton = document.getElementById("format-code") as HTMLButtonElement;
formatButton.onclick = async () => {
  formatButton.disabled = true;
  try {
    const result = await formatCode(editor, async (uri) => {
      const getWorker = await monaco.typescript.getTypeScriptWorker();
      return (await getWorker(uri)).getSyntacticDiagnostics(uri.toString());
    });
    if (result === "invalid") toast(t("Finish the code or fix syntax errors before formatting. Your code was left intact."));
    else if (result === "unavailable") toast(t("Formatting is unavailable right now. Try again."));
  } catch {
    toast(t("Formatting is unavailable right now. Try again."));
  } finally {
    formatButton.disabled = false;
  }
};
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
runBtn.title = t("Run ({shortcut})", { shortcut: runShortcut(navigator.platform) });
const status = document.getElementById("status")!;
const goalsList = document.getElementById("goals")!;
const overlay = document.getElementById("overlay")!;
const overlayText = document.getElementById("overlay-text")!;
const overlayRun = document.getElementById("overlay-run")!;
const passBox = document.getElementById("pass")!;

// Pass screen: one Compare per Script this Lesson touched, then Next Lesson (unlocked by this pass).
passBox.append(...Object.keys(lesson.scripts).map((name) => {
  const b = document.createElement("button");
  b.textContent = t("Compare {name}.ts", { name });
  b.onclick = () => openCompare(name);
  return b;
}));
const retry = document.createElement("button");
retry.textContent = t("Retry Level");
retry.onclick = run;
passBox.append(retry);
if (!project && lessonIndex === CHAPTER_ONE_COUNT - 1) {
  const finalProject = document.createElement("button");
  finalProject.textContent = t("Start final project");
  finalProject.onclick = async () => {
    finalProject.disabled = true;
    try {
      const created = await createProject("platformer", course.slice(0, CHAPTER_ONE_COUNT));
      location.search = `?sandbox=${created.id}`;
    } catch {
      toast(t("Could not create the project. Your course code is unchanged. Try again."));
      finalProject.disabled = false;
    }
  };
  passBox.append(finalProject);
}
const nextIndex = replaying ? current : lessonIndex + 1;
if (nextIndex < course.length) {
  const next = document.createElement("button");
  next.id = "next";
  next.textContent = replaying ? t("Back to Lesson {number}", { number: current + 1 }) : t("Next Lesson ▶");
  next.onclick = () => (location.search = `?lesson=${nextIndex}`);
  passBox.append(next);
}

// Achievements: earned in the worker, saved and shown here.
const earned = loadEarned();
const trophies = document.getElementById("trophies")!;
const map = document.getElementById("achievements")!;
function showTrophies() {
  trophies.textContent = `🏆 ${earned.size} / ${achievements.length}`;
  trophies.ariaLabel = t("Achievements {earned} / {total}", { earned: earned.size, total: achievements.length });
}
showTrophies();
function earn(ids: string[]) {
  for (const id of ids) {
    if (earned.has(id)) continue;
    const a = achievements.find((a) => a.id === id)!;
    earned.add(id);
    saveEarned(id);
    const shown = localizeAchievement(a);
    achievementToast(a.icon, t("Achievement unlocked"), shown.title, shown.message);
    if (!muted) playAchievementCue();
  }
  showTrophies();
  if (!map.hidden) drawMap();
}
const CELL = 76;
const EXTRA = t("Extra: no Lesson teaches this. Build it in your own Player code, in any Lesson or a Sandbox Project.");
const centre = (a: (typeof achievements)[number]) => [a.col * CELL + CELL / 2, a.row * CELL + CELL / 2];
function drawMap() {
  map.querySelector("header span")!.textContent = t("{earned} earned · gold = earned · grey = can earn now · ? = earn the one before it first", { earned: earned.size });
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
    const shown = localizeAchievement(a);
    const tip = state === "hidden" ? `???\n${t("Earn the one before it first")}` : `${shown.title}\n${shown.message}${a.extra ? `\n${EXTRA}` : ""}${state === "earned" ? `\n${t("✓ earned")}` : ""}`;
    const safeTip = escapeHtml(tip);
    return `<i class="tile ${state}" role="img" style="left:${x}px;top:${y}px" title="${safeTip}" aria-label="${safeTip}">${state === "hidden" ? "?" : `<span>${a.icon}</span>`}</i>`;
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
const objectView = objectInspector(document.getElementById("object-list")!, document.getElementById("object-details")!, () => startLevel.art ?? {});
const refreshStoppedObjects = (reset = true) => objectView.setObjects(startingObjects(startLevel.boxes), reset);
refreshStoppedObjects();
let objectViewOpen = false;
const objectsPanel = document.getElementById("objects")!;
function showLeftView(objects: boolean) {
  objectViewOpen = objects;
  document.getElementById("left")!.dataset.view = objects ? "objects" : "explanation";
  document.getElementById("lesson")!.hidden = objects;
  objectsPanel.hidden = !objects;
  document.getElementById("show-explanation")!.setAttribute("aria-pressed", String(!objects));
  document.getElementById("show-objects")!.setAttribute("aria-pressed", String(objects));
  if (objects && !worker) refreshStoppedObjects(false);
  post({ type: "inspect", open: objects });
}
document.getElementById("show-explanation")!.onclick = () => showLeftView(false);
document.getElementById("show-objects")!.onclick = () => showLeftView(true);
images.then((imgs) => drawWorld((document.getElementById("game") as HTMLCanvasElement).getContext("2d")!, imgs, new Camera(startLevel.camera),
  startLevel.boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y)))));
if (project) level = levelView({ project, images, ownImages: projectData!.images, scripts: () => Object.keys(models), save: (own) => { refreshStoppedObjects(); projectImages = { ...own }; void saveCurrentProject(); }, addScript: newScript });
// The Course menu and its Sandbox tab.
const { menu, openMenu, setMode } = courseMenu({ lessonIndex, project, projects, askedProject, earned, images, focusEditor: () => editor.focus(), refreshDocs });
if (asked === null && !project) openMenu(); // the app opens on the Course menu (or the Sandbox menu for ?sandbox)

// The Lesson strip of a Project: its name, Rename / Duplicate / Export / Delete.
if (project) {
  document.getElementById("project-actions")!.hidden = false;
  document.getElementById("rename")!.onclick = () => {
    const name = prompt(t("Project name:"), project.name)?.trim();
    if (!name) return;
    project.name = lessonTitle.textContent = name;
    void saveCurrentProject();
  };
  document.getElementById("duplicate")!.onclick = async () => (location.search = `?sandbox=${(await duplicateProject(project)).id}`);
  for (const [id, game] of [["export", false], ["export-game", true]] as const) {
    const button = document.getElementById(id) as HTMLButtonElement;
    button.onclick = async () => {
      button.disabled = true;
      try {
        await saveCurrentProject();
        const text = game ? await exportGame(project, projectImages) : await exportProject(project, projectImages);
        download(text, game ? exportFileName(project.name).replace(/\.learn-dev\.json$/, ".html") : exportFileName(project.name), game ? "text/html" : "application/json");
        if (game) toast(t("Open the downloaded HTML file in a desktop browser. It works offline; no course or editor needed."));
      } catch (error) { toast(t("Export failed: {message}", { message: String(error) })); }
      finally { button.disabled = false; }
    };
  }
  document.getElementById("delete")!.onclick = () => {
    if (!confirm(t("Delete \"{name}\"? Its Scripts are gone for good.", { name: project.name }))) return;
    deleteProject(project.id).then(() => (location.search = "?sandbox"));
  };
}

// The Reference model is JavaScript so the TS project never sees a second `class Player`; its diagnostics are off.
monaco.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: true });
const compare = document.getElementById("compare")!;
const diff = monaco.editor.createDiffEditor(document.getElementById("diff")!, {
  readOnly: true, wordWrap: "on", automaticLayout: true,
  minimap: { enabled: false }, renderOverviewRuler: false,
});
let comparing = "";
let savedComparisonModel: monaco.editor.ITextModel | undefined;
const comparePrevious = document.getElementById("compare-previous") as HTMLInputElement;
let previousSolution: string | undefined;
comparePrevious.onchange = () => {
  const modified = diff.getModel()!.modified;
  const oldSaved = savedComparisonModel;
  savedComparisonModel = comparePrevious.checked && previousSolution !== undefined
    ? monaco.editor.createModel(previousSolution, "javascript") : undefined;
  diff.setModel({ original: savedComparisonModel ?? models[comparing], modified });
  oldSaved?.dispose();
  document.getElementById("compare-sides")!.textContent = comparePrevious.checked
    ? t("Previous passed solution (left) and Reference code (right)")
    : t("Your code (left) and the Reference code (right)");
};
function openCompare(name: string) {
  const reference = referenceFor(course, name);
  if (reference === undefined) return;
  comparing = name;
  const oldModified = diff.getModel()?.modified;
  diff.setModel(null);
  oldModified?.dispose();
  savedComparisonModel?.dispose();
  savedComparisonModel = undefined;
  previousSolution = !project && lessonIndex > 0 ? snapshot(course[lessonIndex - 1].title)?.[name] : undefined;
  comparePrevious.checked = false;
  document.getElementById("compare-previous-label")!.hidden = previousSolution === undefined;
  document.getElementById("compare-sides")!.textContent = t("Your code (left) and the Reference code (right)");
  diff.setModel({ original: models[name], modified: monaco.editor.createModel(reference, "javascript") });
  document.getElementById("compare-title")!.textContent = t("Compare {name}.ts", { name });
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
  [zoomOut, -1, t("Smaller code"), "-", monaco.KeyCode.Minus],
  [zoomReset, 0, t("Reset code size"), "0", monaco.KeyCode.Digit0],
  [zoomIn, 1, t("Bigger code"), "=", monaco.KeyCode.Equal],
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
    state.textContent = met[i] ? t("Done: ") : t("To do: ");
    li.append(mark, state, localizeCheck(lesson, "goals", i));
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
document.getElementById("console-count")!.textContent = t.count("{count} line", "{count} lines", 0);
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
  document.getElementById("console-count")!.textContent = t.count("{count} line", "{count} lines", consoleLines.length);
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

// Sound and screen text exist only in Sandbox and Chapter 2; so does the mute button.
const v2 = v2Features(project ? { level: project.level } : { lesson: lessonIndex });
const slowPractice = document.getElementById("slow-practice") as HTMLInputElement;
document.getElementById("slow-practice-label")!.hidden = !!project || (lessonIndex !== 18 && lessonIndex !== 19);
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
  level?.setRunning(false);
  clearInterval(watchdog);
  const hadFocus = document.activeElement === stopBtn;
  stopBtn.hidden = true;
  runBtn.hidden = false;
  if (hadFocus) runBtn.focus();
}

function stop(restore = true) {
  worker?.terminate();
  worker = undefined;
  stopSounds();
  showLabels([]);
  let canvas: HTMLCanvasElement | undefined;
  if (restore) {
    const old = document.getElementById("game") as HTMLCanvasElement;
    canvas = old.cloneNode() as HTMLCanvasElement;
    old.replaceWith(canvas);
  }
  ended();
  if (canvas && document.getElementById("level-area")!.hidden)
    images.then(async (imgs) => drawWorld(canvas.getContext("2d")!, imgs, new Camera(startLevel.camera),
      startLevel.boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, b.script, new Vector2(b.x, b.y))), undefined,
      project ? await ownSprites(startLevel.art, level!.images()).catch(() => ({})) : {}));
  if (restore) refreshStoppedObjects();
}

let checkingCode = false;
let unlockMenuTimer: number | undefined;
async function run() {
  if (checkingCode || running) return;
  if (unlockMenuTimer !== undefined) clearTimeout(unlockMenuTimer);
  checkingCode = true;
  const versions = Object.fromEntries(Object.entries(models).map(([name, model]) => [name, model.getVersionId()]));
  const errors: CodeError[] = [];
  const scripts: Record<string, string> = {};
  try {
    const getWorker = await monaco.typescript.getTypeScriptWorker();
    const ts = await getWorker(...Object.values(models).map((model) => model.uri));
    for (const [name, model] of Object.entries(models)) {
      const uri = model.uri.toString();
      const diagnostics = [...await ts.getSyntacticDiagnostics(uri), ...await ts.getSemanticDiagnostics(uri)];
      for (const diagnostic of diagnostics) {
        if (diagnostic.category !== 1) continue;
        const pos = model.getPositionAt(diagnostic.start ?? 0);
        errors.push({ script: name, line: pos.lineNumber, column: pos.column, message: diagnostic.messageText });
      }
    }
    if (!errors.length) {
      for (const [name, model] of Object.entries(models)) {
        try { scripts[name] = transpile(model.getValue()); }
        catch (error) {
          const at = error as Error & { loc?: { line: number; column: number } };
          errors.push({ script: name, line: at.loc?.line ?? 1, column: (at.loc?.column ?? 0) + 1, message: at.message });
        }
      }
    }
  } catch (error) {
    errors.push({ script: openScript, line: 1, column: 1, message: String(error) });
  } finally { checkingCode = false; }
  if (Object.entries(models).some(([name, model]) => model.getVersionId() !== versions[name])) return;
  if (errors.length) {
    clearLines(consoleLines);
    const guidance = t("Fix the code errors below, then Run again.");
    codeErrorsShown.add(guidance);
    log([{ level: "log", text: guidance, count: 1 }]);
    const lines = codeErrorLines(errors);
    lines.forEach((line) => codeErrorsShown.add(line.text));
    log(lines);
    openConsole(true);
    return;
  }
  codeErrorsShown.clear();
  stop(false);
  objectView.setObjects([], true);
  level?.setRunning(true);
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
    showOverlay(t("Click to play"), false);
  };
  canvas.onfocus = () => {
    if (!running) return;
    paused = false;
    post({ type: "resume" });
    showOverlay("", false);
  };

  unlockAudio(); // run() follows a click or Ctrl+Enter, including in Chapter 1
  const offscreen = canvas.transferControlToOffscreen();
  worker = new RunnerWorker();
  stopBtn.hidden = false;
  runBtn.hidden = true;
  running = true;
  paused = false;
  canvas.focus();
  post({ type: "start", canvas: offscreen, ...(project ? { level: project.level, images: level!.images() } : { lesson: lessonIndex, slowPractice: slowPractice.checked }), earned: [...earned], scripts }, [offscreen]);
  post({ type: "inspect", open: objectViewOpen });

  let lastTick = performance.now();
  worker.onmessage = (e: MessageEvent<FromWorker>) => {
    if (e.data.type === "tick") lastTick = performance.now();
    if (e.data.type === "paused") paused = e.data.paused;
    if (e.data.type === "logs") log(e.data.lines);
    if (e.data.type === "achievements") earn(e.data.ids);
    if (e.data.type === "sounds" && !muted) playClips(e.data.names);
    if (e.data.type === "labels") showLabels(e.data.labels);
    if (e.data.type === "objects") objectView.setObjects(e.data.objects);
    if (e.data.type === "check") {
      showGoals(e.data.met);
      if (e.data.lost || e.data.passed) ended(); // the worker stopped its loop on purpose
      if (e.data.lost) {
        const lost = e.data.lost;
        const index = lesson.lose.findIndex((item) => item.message === lost);
        showOverlay(index < 0 ? lost : localizeCheck(lesson, "lose", index), true);
      }
      if (e.data.passed) {
        const wasUnlocked = sandboxUnlocked(course);
        markPassed(lesson.title);
        saveSnapshot(lesson.title, Object.fromEntries(Object.entries(models).map(([n, m]) => [n, m.getValue()])));
        showProgress();
        showOverlay(t("✓ Lesson passed"), false, true);
        toast(t("Lesson passed"));
        if (!wasUnlocked && sandboxUnlocked(course)) {
          refreshDocs();
          toast(t("🔓 Sandbox and Chapter 2 unlocked"));
          unlockMenuTimer = setTimeout(() => {
            openMenu("course");
            setMode("sandbox");
          }, 1500);
        }
      }
    }
    if (e.data.type === "error") {
      ended(); // the worker already stopped its loop; terminating now would blank the last frame
      const where = e.data.script && e.data.line ? `${e.data.script}.ts:${e.data.line} ` : "";
      const message = localizeRuntimeError(e.data.message);
      log([{ level: "error", text: `${where}${message}`, count: 1 }]);
      const model = e.data.script && models[e.data.script];
      if (model && e.data.line) {
        show(e.data.script!);
        monaco.editor.setModelMarkers(model, "runtime", [{
          severity: monaco.MarkerSeverity.Error,
          message,
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
      status.textContent = t("Your code ran forever. Look at your while / for loops.");
    }
  }, 250);
}

runBtn.onclick = overlayRun.onclick = run;
overlay.onclick = (e) => {
  if (running && e.target !== overlayRun) document.getElementById("game")!.focus(); // "Click to play"
};
stopBtn.onclick = () => stop();

// Ask DeepSeek: copy the Tutor prompt, then open it unsent in DeepSeek's composer (spec 088).
const promptBox = document.getElementById("prompt-box") as HTMLDialogElement;
const promptText = promptBox.querySelector("textarea")!;
const showPromptFallback = (prompt: string) => {
  promptText.value = prompt;
  if (!promptBox.open) promptBox.showModal();
  promptText.select();
};
document.getElementById("prompt-select")!.onclick = () => promptText.select();
document.getElementById("prompt-close")!.onclick = () => promptBox.close();
document.getElementById("ask")!.onclick = async () => {
  const prompt = tutorPrompt({
    lesson: project ? undefined : {
      title: displayLesson.title,
      explanation: displayLesson.explanation,
      goals: goals.map((_, i) => ({ message: localizeCheck(lesson, "goals", i), met: !!goalsMet[i] })),
      hints: hints.slice(0, opened),
    },
    script: { name: openScript, code: models[openScript].getValue() },
    console: consoleLines.map(lineText),
  });
  const outcome = await askDeepSeek({
    prompt,
    copy: (text) => navigator.clipboard.writeText(text),
    open: (url) => window.open(url, "_blank"), // after copying: a focused new tab would make the copy fail
    showFallback: showPromptFallback,
  });
  if (outcome === "prefilled") toast(t("DeepSeek should have the prompt in its box, unsent. Add your question after `My question:`. If the box is empty, paste it (Ctrl/Cmd+V)."));
  else if (outcome === "manual") toast(t("This prompt can't fit in a DeepSeek link, so it's copied. Paste it into DeepSeek (Ctrl/Cmd+V), then add your question."));
  // A blocked popup or failed copy shows the full prompt in the dialog; no success claim.
  if ((outcome === "prefilled" || outcome === "manual") && !localStorage.getItem("asked-deepseek")) {
    localStorage.setItem("asked-deepseek", "1");
    toast(t("You need a free DeepSeek account."));
  }
};

// A language change reloads the existing URL so every screen uses one catalog.
// Restore the visible panel and keyboard target after the new page is ready.
const localeView = sessionStorage.getItem("locale:view");
if (localeView) {
  sessionStorage.removeItem("locale:view");
  try {
    const view = JSON.parse(localeView) as { menu?: boolean; mode?: "course" | "sandbox"; card?: number; tab?: string; docsPage?: string; objects?: boolean; focus?: string };
    if (view.tab) document.querySelector<HTMLElement>(`#tabs [data-key="${CSS.escape(view.tab)}"]`)?.click();
    if (view.docsPage) openDocs(view.docsPage);
    if (view.objects) showLeftView(true);
    if (view.menu) {
      openMenu(view.mode);
      const dots = document.querySelectorAll<HTMLElement>("#menu-dots button");
      if (view.card !== undefined && view.card >= 0) dots[view.card]?.click();
    }
    document.getElementById(view.focus ?? "")?.focus();
  } catch { /* A stale view record must not block the app. */ }
}
