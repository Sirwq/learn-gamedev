// Course menu: a cover carousel, one card per Lesson. Once unlocked, a Sandbox tab: one card per Project, then "+ New".
import { course } from "./lessons/course";
import { loadSnapshot, snapshot } from "./lesson";
import { CHAPTER_ONE_COUNT, CHAPTER_TWO_COUNT, cardStates, chapterProgress, currentLesson } from "./check";
import { achievements } from "./achievements";
import { type Box, Camera, GameObject, Vector2 } from "./engine";
import { drawWorld, type Images } from "./sprites";
import { swipeStep } from "./swipe";
import { type Project, sandboxUnlocked, setDevUnlock } from "./sandbox";
import { createProject, importProject, loadProjects } from "./project-storage";
import { toast } from "./toast";
import { backupFileName, backupReminder, download, exportEverything, type ImportPlan, lastBackup, planImport, snoozeReminder } from "./backup";
import { localizeLesson, t } from "./i18n";

export const sandboxEmptyMessage = (count: number) => count === 0
  ? t("New here? Try Example: Sandbox tour, or carry on with Chapter 2 in the Course.")
  : "";

type Page = {
  /** The Lesson this page shows (the open Project's page still has one). */
  lessonIndex: number;
  project: Project | undefined;
  /** Every Project, as loaded with the page; the menu reloads them when a tab saves one. */
  projects: Project[];
  /** ?sandbox's value, when Sandbox is unlocked. */
  askedProject: string | null;
  /** Live: Achievements earned so far, for the menu's stats line. */
  earned: Set<string>;
  images: Promise<Images>;
  /** Where focus goes when the menu closes and nothing else had it. */
  focusEditor: () => void;
  refreshDocs: () => void;
};

export function courseMenu({ lessonIndex, project, projects: loaded, askedProject, earned, images, focusEditor, refreshDocs }: Page) {
  const current = currentLesson(course);
  const lessonTitle = document.getElementById("lesson-title")!;
  const trophies = document.getElementById("trophies")!;
  const map = document.getElementById("achievements")!;
  const menu = document.getElementById("menu")!;
  const rail = document.getElementById("rail")!;
  const replayBox = document.getElementById("replay") as HTMLDialogElement;
  const newBox = document.getElementById("new-project") as HTMLDialogElement;
  const savesBox = document.getElementById("saves") as HTMLDialogElement;
  const reminder = document.getElementById("menu-reminder")!;
  const chipCourse = document.getElementById("chip-course")!;
  const chipSandbox = document.getElementById("chip-sandbox")!;
  const prevBtn = document.getElementById("menu-prev") as HTMLButtonElement;
  const nextBtn = document.getElementById("menu-next") as HTMLButtonElement;
  const dots = document.getElementById("menu-dots")!;
  let mode: "course" | "sandbox" = "course";
  let focused = lessonIndex;
  let states = cardStates(course);
  let chapters = chapterProgress(course);
  let menuCurrent = current; // moves on when a Lesson is passed on this page
  let projects = loaded;
  function coverCard(small: string, title: string, i: number) {
    const card = document.createElement("button");
    card.tabIndex = -1; // ← → move between cards
    card.innerHTML = `<canvas width="240" height="320"></canvas><span class="tag"></span><span class="name"><small></small></span>`;
    card.querySelector("small")!.textContent = small;
    card.querySelector(".name")!.append(title); // Project names are the student's own text
    card.onclick = () => (i === focused ? pick(i) : focusCard(i));
    return card;
  }
  const courseCards = course.map((l, i) => coverCard(t("Lesson {number}", { number: i + 1 }).toUpperCase(), localizeLesson(l).title.replace(/^\d+\.\s*/, ""), i));
  let projectCards: HTMLButtonElement[] = [];
  const cards = () => (mode === "course" ? courseCards : projectCards);
  const unlockLesson = (i: number) => i >= CHAPTER_ONE_COUNT && !chapters.unlocked ? CHAPTER_ONE_COUNT : menuCurrent + 1;
  const coverOf = (i: number) => cards()[i].querySelector("canvas")!;
  const menuBg = document.getElementById("menu-bg") as HTMLCanvasElement;
  const drawBg = () => menuBg.getContext("2d")!.drawImage(coverOf(focused), 0, 0);
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
  function buildProjectCards() {
    projectCards = [...projects.map((p, i) => coverCard(t("PROJECT"), p.name, i)), coverCard("", t("+ New"), projects.length)];
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
    mode === "sandbox" ? (i === projects.length ? t("Create") : t("Open"))
    : states[i] === "locked" ? t("How to unlock") : states[i] === "passed" && i !== menuCurrent ? t("Replay") : t("Play");
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
        card.ariaLabel = i < projects.length ? t("Project {name}", { name: projects[i].name }) : t("New Project");
        card.querySelector(".tag")!.textContent = projects[i] && projects[i].id === project?.id ? t("▶ open") : "";
        return;
      }
      card.className = `cover ${states[i]}`;
      card.ariaLabel = t("{title}, {state}", { title: localizeLesson(course[i]).title, state: { passed: t("passed"), current: t("Up next"), locked: t("locked") }[states[i]] });
      const tag = card.querySelector(".tag")!;
      if (states[i] === "locked") tag.innerHTML = LOCK_BADGE; // our own markup
      else tag.textContent = { passed: t("✓ passed"), current: t("▶ next") }[states[i]];
    });
    drawBg();
    const meta = document.getElementById("card-meta")!;
    const line = (cls: string, html: string) => `<div class="${cls}">${html}</div>`;
    const files = (names: string[]) => line("meta-files", t("Code in {files}", { files: names.map((n) => `<code translate="no">${n.replace(/[&<]/g, (c) => (c === "&" ? "&amp;" : "&lt;"))}.ts</code>`).join(", ") }));
    let title;
    if (mode === "sandbox") {
      const p = projects[focused];
      title = p ? p.name : t("New Project");
      meta.innerHTML = p ? files(Object.keys(p.scripts)) : line("meta-concept", sandboxEmptyMessage(projects.length) || t("Blank, My platformer, or Example: Sandbox tour"));
    } else {
      const scripts = [...new Set(course.slice(0, focused + 1).flatMap((l) => Object.keys(l.scripts)))];
      const state = { passed: [CHECK, t("Passed")], current: [PLAY, t("Up next")], locked: [LOCK, t("Pass Lesson {number} to unlock", { number: unlockLesson(focused) })] }[states[focused]];
      // Code words in the concept (Update(), Time.deltaTime, if, &&) get the inline-code look; "Script:" is a plain word.
      const concept = localizeLesson(course[focused]).concept.replace(/else if|&&|\b(?:if|for)\b|[A-Z]\w*(?:\.\w+)*(?:\(\))?(?!:)/g, (c) => `<code translate="no">${c.replaceAll("&", "&amp;")}</code>`);
      title = localizeLesson(course[focused]).title;
      meta.innerHTML = line("meta-concept", `<span class="pill ${states[focused]}">${state[0]}${state[1]}</span> ${concept}`) + files(scripts);
    }
    document.getElementById("card-title")!.textContent = title;
    prevBtn.disabled = focused === 0;
    nextBtn.disabled = focused === list.length - 1;
    if ((document.activeElement as HTMLButtonElement).disabled) menu.focus(); // a disabled button drops focus to <body>
    document.getElementById("menu-play")!.querySelector("b")!.textContent = playLabel(focused);
    const chapterTwoStat = chapters.unlocked ? ` · ${t("Ch. 2 {done} / {total}", { done: chapters.chapterTwo, total: CHAPTER_TWO_COUNT })}` : "";
    const chapterTwoSpoken = chapters.unlocked ? `, ${t("Chapter 2: {done} of {total} Lessons passed", { done: chapters.chapterTwo, total: CHAPTER_TWO_COUNT })}` : "";
    document.getElementById("menu-stats")!.innerHTML =
      `<span aria-hidden="true">🏆 ${earned.size} / ${achievements.length}   ✓ ${chapters.chapterOne} / ${CHAPTER_ONE_COUNT}${chapterTwoStat}</span>` +
      `<span class="sr-only">${t("{earned} of {achievements} Achievements, Chapter 1: {done} of {total} Lessons passed{chapterTwo}", { earned: earned.size, achievements: achievements.length, done: chapters.chapterOne, total: CHAPTER_ONE_COUNT, chapterTwo: chapterTwoSpoken })}</span>`;
  }
  const menuLive = document.getElementById("menu-live")!;
  const announce = () =>
    (menuLive.textContent = mode === "course"
      ? t("{name}, Lesson {number} of {total}", { name: cards()[focused].ariaLabel || "", number: focused + 1, total: cards().length })
      : t("{name}, {number} of {total}", { name: cards()[focused].ariaLabel || "", number: focused + 1, total: cards().length }));
  function focusCard(i: number) {
    focused = Math.max(0, Math.min(cards().length - 1, i));
    layoutMenu();
    announce();
    if (dots.contains(document.activeElement)) (dots.children[focused] as HTMLElement).focus();
  }
  function showMode(m: typeof mode) {
    mode = m;
    document.getElementById("course-intro")!.hidden = m !== "course";
    if (m === "sandbox") buildProjectCards();
    focused = m === "course" ? lessonIndex : Math.max(0, projects.findIndex((p) => p.id === project?.id));
    rail.replaceChildren(...cards());
    const noun = m === "course" ? t("Lesson") : t("Project");
    dots.ariaLabel = m === "course" ? t("Lessons") : t("Projects");
    prevBtn.ariaLabel = t("Previous {name}", { name: noun });
    nextBtn.ariaLabel = t("Next {name}", { name: noun });
    const dotButtons = cards().map((_, i) => {
      const dot = document.createElement("button");
      dot.ariaLabel = m === "course" ? localizeLesson(course[i]).title : projects[i]?.name ?? t("New Project");
      dot.onclick = () => focusCard(i);
      return dot;
    });
    const chapterLabel = document.createElement("span");
    chapterLabel.className = "chapter-label";
    chapterLabel.textContent = `${chapters.unlocked ? "" : "🔒 "}${t("Chapter 2")}`;
    chapterLabel.style.left = dotButtons.length > CHAPTER_ONE_COUNT
      ? `${100 * CHAPTER_ONE_COUNT / dotButtons.length}%` : "calc(100% - 72px)";
    dots.replaceChildren(...dotButtons, ...(m === "course" ? [chapterLabel] : []));
    for (const [chip, on] of [[chipCourse, m === "course"], [chipSandbox, m === "sandbox"]] as const) {
      chip.classList.toggle("on", on);
      chip.ariaPressed = String(on);
    }
    document.getElementById("menu-heading")!.textContent = m === "course" ? t("Choose a Lesson") : t("Choose a Project");
    document.title = `${m === "course" ? t("Lessons") : t("Projects")} · learn-dev`;
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
    chapters = chapterProgress(course);
    menuCurrent = currentLesson(course);
    document.getElementById("course-continue")!.textContent = t("Continue Lesson {number}", { number: menuCurrent + 1 });
    document.getElementById("course-continue")!.hidden = menuCurrent === 0;
    chipSandbox.hidden = !sandboxUnlocked(course);
    const due = backupReminder(course);
    reminder.hidden = !due;
    reminder.querySelector("span")!.textContent = due;
    menu.hidden = false;
    showMode(m);
    menu.focus();
  }
  function closeMenu() {
    menu.hidden = true;
    for (const el of behind) el.inert = false;
    document.title = `${lessonTitle.textContent} · learn-dev`;
    if (opener instanceof HTMLElement && opener !== document.body) opener.focus();
    else focusEditor();
  }
  const go = (i: number) => (location.search = `?lesson=${i}`);
  function pick(i: number) {
    if (mode === "sandbox") {
      if (i === projects.length) return newBox.showModal();
      if (projects[i].id === project?.id) return closeMenu();
      return void (location.search = `?sandbox=${projects[i].id}`);
    }
    if (states[i] === "locked") return void toast(t("Pass Lesson {number} to unlock", { number: unlockLesson(i) }));
    if (i === lessonIndex && !project) return closeMenu();
    if (states[i] === "current" || (states[i] === "passed" && i === menuCurrent) || !snapshot(course[i].title)) return go(i);
    replayBox.querySelector("h3")!.textContent = t("Replay {title}?", { title: localizeLesson(course[i]).title });
    replayBox.querySelector("#replay-load small")!.textContent =
      t("Your editor goes back to the code you passed it with. Your newer code is saved and comes back when you return to Lesson {number}.", { number: menuCurrent + 1 });
    (replayBox.querySelector("#replay-keep") as HTMLButtonElement).onclick = () => go(i);
    (replayBox.querySelector("#replay-load") as HTMLButtonElement).onclick = () => {
      loadSnapshot(course[i].title);
      go(i);
    };
    replayBox.showModal();
  }
  document.getElementById("replay-cancel")!.onclick = () => replayBox.close();
  document.getElementById("new-cancel")!.onclick = () => newBox.close();
  const create = (kind: "blank" | "platformer" | "tour") => async () => (location.search = `?sandbox=${(await createProject(kind, course)).id}`);
  document.getElementById("new-blank")!.onclick = create("blank");
  document.getElementById("new-platformer")!.onclick = create("platformer");
  document.getElementById("new-tour")!.onclick = create("tour");
  // Import always makes a new Project; a bad file gets importProject's plain message and writes nothing.
  async function importFile(file: File) {
    try {
      location.search = `?sandbox=${(await importProject(await file.text())).id}`;
    } catch (e) {
      if (e instanceof Error && e.name === "QuotaExceededError") throw e; // main.ts's storage-full toast
      newBox.close(); // the toast would sit under the modal dialog
      toast(e instanceof Error ? e.message : t("Projects with images can't be saved in this browser right now. Reload the page and try again."));
    }
  }
  const fileInput = document.getElementById("new-file-input") as HTMLInputElement;
  document.getElementById("new-file")!.onclick = () => fileInput.click();
  fileInput.onchange = () => {
    if (fileInput.files?.[0]) importFile(fileInput.files[0]);
    fileInput.value = "";
  };

  // 💾 Saves (spec 059): Export everything / Import everything, from Lesson 1.
  async function backUp() {
    download(await exportEverything(course), backupFileName());
    reminder.hidden = true;
  }
  const savesMain = document.getElementById("saves-main")!;
  const savesConfirm = document.getElementById("saves-confirm")!;
  const showSaves = (confirming: boolean) => {
    savesMain.hidden = confirming;
    savesConfirm.hidden = !confirming;
    if (!savesBox.open) savesBox.showModal();
    (savesBox.querySelector(confirming ? "#saves-yes" : "#saves-export") as HTMLElement).focus();
  };
  document.getElementById("menu-saves")!.onclick = () => {
    document.getElementById("saves-last")!.textContent = t("Last backup: {when}.", { when: lastBackup() });
    savesBox.querySelector("#saves-export small")!.textContent = sandboxUnlocked(course)
      ? t("Your Lessons, code, Achievements and every Project, in one file.")
      : t("Your Lessons, code and Achievements, in one file.");
    document.getElementById("saves-safari")!.hidden = !/^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
    navigator.storage?.persisted?.().then((yes) => (document.getElementById("saves-persist")!.hidden = yes), () => {});
    showSaves(false);
  };
  document.getElementById("saves-export")!.onclick = async () => {
    await backUp();
    document.getElementById("saves-last")!.textContent = t("Last backup: {when}.", { when: lastBackup() });
  };
  document.getElementById("saves-close")!.onclick = () => savesBox.close();
  let plan: ImportPlan | undefined;
  /** A backup or one Project: its one-line summary first, then Import / Cancel. */
  async function openFile(file: File) {
    try {
      plan = await planImport(await file.text(), course);
    } catch (e) {
      savesBox.close();
      newBox.close();
      return void toast((e as Error).message);
    }
    newBox.close();
    document.getElementById("saves-summary")!.textContent = plan.summary;
    showSaves(true);
  }
  document.getElementById("saves-yes")!.onclick = async () => {
    let done;
    try {
      done = await plan!.apply();
    } catch (e) {
      if (e instanceof Error && e.name === "QuotaExceededError") throw e; // main.ts's storage-full toast
      savesBox.close();
      return void toast(e instanceof Error ? e.message : t("Projects with images can't be saved in this browser right now. Reload the page and try again."));
    }
    if (!plan!.single) return location.reload(); // progress and Projects changed under the whole page
    if (sandboxUnlocked(course)) return void (location.search = `?sandbox=${(done as Project).id}`);
    savesBox.close();
    toast(t("Saved. This is a Sandbox Project; you'll find it in Sandbox after Lesson 15."));
  };
  document.getElementById("saves-no")!.onclick = () => savesBox.close();
  const savesFile = document.getElementById("saves-file") as HTMLInputElement;
  document.getElementById("saves-import")!.onclick = () => savesFile.click();
  savesFile.onchange = () => {
    if (savesFile.files?.[0]) openFile(savesFile.files[0]);
    savesFile.value = "";
  };
  document.getElementById("reminder-backup")!.onclick = () => backUp().then(() => menu.focus());
  document.getElementById("reminder-later")!.onclick = () => {
    snoozeReminder();
    reminder.hidden = true;
    menu.focus();
  };
  const dropsFile = (e: DragEvent) => !!e.dataTransfer?.types.includes("Files");
  menu.addEventListener("dragover", (e) => dropsFile(e) && e.preventDefault());
  menu.addEventListener("drop", (e) => {
    if (!dropsFile(e) || !e.dataTransfer!.files[0]) return;
    e.preventDefault();
    openFile(e.dataTransfer!.files[0]);
  });
  replayBox.onclose = newBox.onclose = savesBox.onclose = () => menu.focus();
  replayBox.onkeydown = newBox.onkeydown = savesBox.onkeydown = (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const options = Array.from((e.currentTarget as HTMLDialogElement).querySelectorAll<HTMLButtonElement>("button")).filter((b) => b.offsetParent);
    const k = options.indexOf(document.activeElement as HTMLButtonElement);
    options[(k + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length].focus();
  };
  chipCourse.onclick = () => setMode("course");
  chipSandbox.onclick = () => setMode("sandbox");
  if (import.meta.env.DEV) {
    // Dev build only: check Sandbox screens without passing the Course; no toast, no slide, no Lesson marked passed.
    const devToggle = document.createElement("button");
    devToggle.className = "chip";
    const devLabel = () => (devToggle.textContent = localStorage.getItem("dev:sandbox-unlocked") ? "DEV: Lock Sandbox" : "DEV: Unlock Sandbox");
    devToggle.onclick = () => {
      setDevUnlock(!localStorage.getItem("dev:sandbox-unlocked"));
      devLabel();
      chipSandbox.hidden = !sandboxUnlocked(course);
      refreshDocs();
      if (chipSandbox.hidden) setMode("course");
    };
    devLabel();
    document.getElementById("menu-saves")!.before(devToggle);
  }
  const menuKeys: Record<string, () => void> = {
    ArrowLeft: () => focusCard(focused - 1),
    ArrowRight: () => focusCard(focused + 1),
    Escape: closeMenu,
    KeyA: () => trophies.click(),
    KeyQ: () => (chipSandbox.hidden ? toast(t("TypeScript is the only Course for now. C# comes later.")) : setMode("course")),
    KeyE: () => (chipSandbox.hidden ? toast(t("Sandbox opens when you finish the Course")) : setMode("sandbox")),
  };
  document.addEventListener("keydown", (e) => {
    if (menu.hidden || !map.hidden || replayBox.open || newBox.open || savesBox.open || map.contains(e.target as Node)) return;
    // Enter on a focused button clicks it; on the menu itself it plays the focused card.
    const key = menuKeys[e.code] ?? (e.code === "Enter" && e.target === menu ? () => pick(focused) : undefined);
    if (!key) return;
    e.preventDefault();
    key();
  });
  const menuBack = document.getElementById("menu-back")!;
  menuBack.onclick = closeMenu;
  menuBack.ariaLabel = menuBack.title = project ? t("Back to Project") : t("Back to Lesson {number}", { number: lessonIndex + 1 });
  menuBack.lastChild!.textContent = ` ${menuBack.ariaLabel}`;
  const phoneNote = document.getElementById("menu-phone")!;
  phoneNote.querySelector("button")!.onclick = () => (phoneNote.remove(), menu.focus());
  const menuOpen = document.getElementById("menu-open")!;
  if (project) {
    menuOpen.ariaLabel = menuOpen.title = t("Back to Projects");
    menuOpen.lastChild!.textContent = ` ${t("Back to Projects")}`;
  }
  document.getElementById("menu-achievements")!.onclick = () => trophies.click();
  document.getElementById("course-start")!.onclick = () => pick(0);
  document.getElementById("course-continue")!.onclick = () => pick(menuCurrent);
  drawCover(document.getElementById("course-preview") as HTMLCanvasElement, course[course.length - 1].level.boxes);
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
  new BroadcastChannel("projects").onmessage = async () => {
    projects = await loadProjects();
    if (!menu.hidden && mode === "sandbox") showMode("sandbox");
  };
  return { menu, openMenu, setMode };
}
