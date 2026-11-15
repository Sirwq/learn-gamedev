import type { Lesson } from "./lesson";
import type { Achievement } from "./achievements";
import { staticMessages } from "./static-messages";
import { russian } from "./ru";

/** English is the source catalog. Entries are the complete English message, including named slots. */
export const english = {
  ...staticMessages,
  "saved lesson work": "saved lesson work",
  "Replace existing lesson code with the backup: {scripts}. Leave unchecked to keep this browser’s code.": "Replace existing lesson code with the backup: {scripts}. Leave unchecked to keep this browser’s code.",
  "This Project cannot be edited here. Close its other tab and reopen it in a browser with Web Locks support.": "This Project cannot be edited here. Close its other tab and reopen it in a browser with Web Locks support.",
  "The backup has different lesson code. Keep this browser’s code, or choose replacement below.": "The backup has different lesson code. Keep this browser’s code, or choose replacement below.",
  "Contact notifications": "Contact notifications",
  "Enable on both objects. Reports overlap; does not stop movement.": "Enable on both objects. Reports overlap; does not stop movement.",
  "Enabled": "Enabled",
  "Disabled": "Disabled",

  "Mute": "Mute",
  "Export project": "Export project",
  "Export game": "Export game",
  "Saved on this device": "Saved on this device",
  "Saving…": "Saving…",
  "Save failed — click to retry": "Save failed — click to retry",
  "Play / Restart": "Play / Restart",
  "Open this HTML file in a desktop browser, then press Play. Click the game to use its keyboard controls. Arrow keys / WASD, Space, S: depends on the game.": "Open this HTML file in a desktop browser, then press Play. Click the game to use its keyboard controls. Arrow keys / WASD, Space, S: depends on the game.",
  "Open the downloaded HTML file in a desktop browser. It works offline; no course or editor needed.": "Open the downloaded HTML file in a desktop browser. It works offline; no course or editor needed.",
  "Export failed: {message}": "Export failed: {message}",

  "Start final project": "Start final project",
  "Could not create the project. Your course code is unchanged. Try again.": "Could not create the project. Your course code is unchanged. Try again.",
  "Final project: two routes, one new mechanic": "Final project: two routes, one new mechanic",
  "Rename your project, then open Level. Build a safe route and a harder shortcut to the same finish. Change or invent at least one mechanic; explain its rule in your own words.": "Rename your project, then open Level. Build a safe route and a harder shortcut to the same finish. Change or invent at least one mechanic; explain its rule in your own words.",
  "Ready to share: both routes work from a fresh Run, failure allows recovery, controls are clear, and the Console has no errors. Save an editable project export as your backup.": "Ready to share: both routes work from a fresh Run, failure allows recovery, controls are clear, and the Console has no errors. Save an editable project export as your backup.",
  "Explain: why take the risky route? Which code creates your mechanic? What failed in testing, and what did you change? Ask someone to try the game without your help.": "Explain: why take the risky route? Which code creates your mechanic? What failed in testing, and what did you change? Ask someone to try the game without your help.",
  "Where did this code come from?": "Where did this code come from?",
  "Your saved scripts carry into the next lesson. Only new files get starter code; moving between lessons does not replace your work with a reference.": "Your saved scripts carry into the next lesson. Only new files get starter code; moving between lessons does not replace your work with a reference.",
  "Compare shows highlighted differences from the latest passed reference. You can also view your previous passed solution there. Pick one changed line and explain how it changes the game.": "Compare shows highlighted differences from the latest passed reference. You can also view your previous passed solution there. Pick one changed line and explain how it changes the game.",
  "Show my previous passed solution": "Show my previous passed solution",
  "Previous passed solution (left) and Reference code (right)": "Previous passed solution (left) and Reference code (right)",
  "Loading the reference replaces the current editor file with a working example. Your passed solution stays saved. You can undo this edit until you leave or reload the page.": "Loading the reference replaces the current editor file with a working example. Your passed solution stays saved. You can undo this edit until you leave or reload the page.",
  "Slow practice (next Run)": "Slow practice (next Run)",
  "Build your own 2D platformer in the browser": "Build your own 2D platformer in the browser",
  "21 lessons · 2 chapters · your own Sandbox project": "21 lessons · 2 chapters · your own Sandbox project",
  "Start Lesson 1": "Start Lesson 1",
  "Continue Lesson {number}": "Continue Lesson {number}",
  "About this course": "About this course",
  "Example platformer level with platforms and obstacles": "Example platformer level with platforms and obstacles",
  "Example: your platformer after Chapter 2": "Example: your platformer after Chapter 2",
  "For beginners who know variables and simple expressions. No game engine experience needed.": "For beginners who know variables and simple expressions. No game engine experience needed.",
  "Learn movement, jumps, coins and game feel, then build your own level in Sandbox. Chapter 2 and Sandbox unlock after Lesson 15.": "Learn movement, jumps, coins and game feel, then build your own level in Sandbox. Chapter 2 and Sandbox unlock after Lesson 15.",
  "Read the task, change the code, then press Run to try it. Hints and Docs are there when you need them.": "Read the task, change the code, then press Run to try it. Hints and Docs are there when you need them.",
  "Run": "Run", "Stop": "Stop", "Docs": "Docs", "Level": "Level", "Sandbox": "Sandbox",
  "Finish the code or fix syntax errors before formatting. Your code was left intact.": "Finish the code or fix syntax errors before formatting. Your code was left intact.",
  "Formatting is unavailable right now. Try again.": "Formatting is unavailable right now. Try again.",
  "Hint {number} of {total}": "Hint {number} of {total}",
  "Hint {number}": "Hint {number}",
  "{count} line": "{count} line", "{count} lines": "{count} lines",
  "{count} Lesson passed": "{count} Lesson passed", "{count} Lessons passed": "{count} Lessons passed",
  "{count} Achievement": "{count} Achievement", "{count} Achievements": "{count} Achievements",
  "{count} Project": "{count} Project", "{count} Projects": "{count} Projects",
  "{count} day": "{count} day", "{count} days": "{count} days",
  "Lesson {number}": "Lesson {number}", "Project {name}": "Project {name}",
  "Pass Lesson {number} to unlock": "Pass Lesson {number} to unlock",
  "Back to Lesson {number}": "Back to Lesson {number}",
  "Replay {title}?": "Replay {title}?",
  "{title}, {state}": "{title}, {state}",
  "{name}, {number} of {total}": "{name}, {number} of {total}",
  "{name}, Lesson {number} of {total}": "{name}, Lesson {number} of {total}",
  "Code in {files}": "Code in {files}",
  "Passed": "Passed", "Up next": "Up next", "locked": "locked", "passed": "passed", "▶ next": "▶ next", "✓ passed": "✓ passed", "▶ open": "▶ open",
  "Create": "Create", "Open": "Open", "How to unlock": "How to unlock", "Replay": "Replay", "Play": "Play",
  "Choose a Project": "Choose a Project", "Projects": "Projects", "New Project": "New Project", "Chapter 2": "Chapter 2",
  "Previous {name}": "Previous {name}", "Next {name}": "Next {name}", "{name}s": "{name}s",
  "Blank, My platformer, or Example: Sandbox tour": "Blank, My platformer, or Example: Sandbox tour",
  "New here? Try Example: Sandbox tour, or carry on with Chapter 2 in the Course.": "New here? Try Example: Sandbox tour, or carry on with Chapter 2 in the Course.",
  "Your editor goes back to the code you passed it with. Your newer code is saved and comes back when you return to Lesson {number}.": "Your editor goes back to the code you passed it with. Your newer code is saved and comes back when you return to Lesson {number}.",
  "Last backup: {when}.": "Last backup: {when}.",
  "Your Lessons, code, Achievements and every Project, in one file.": "Your Lessons, code, Achievements and every Project, in one file.",
  "Your Lessons, code and Achievements, in one file.": "Your Lessons, code and Achievements, in one file.",
  "Saved. This is a Sandbox Project; you'll find it in Sandbox after Lesson 15.": "Saved. This is a Sandbox Project; you'll find it in Sandbox after Lesson 15.",
  "TypeScript is the only Course for now. C# comes later.": "TypeScript is the only Course for now. C# comes later.",
  "Sandbox opens when you finish the Course": "Sandbox opens when you finish the Course",
  "The selected object no longer exists. Select another object.": "The selected object no longer exists. Select another object.",
  "Select an object to inspect it.": "Select an object to inspect it.",
  "This Level has no objects yet.": "This Level has no objects yet.",
  "Transform": "Transform", "Position x": "Position x", "Position y": "Position y", "Box / hitbox": "Box / hitbox",
  "Width": "Width", "Height": "Height", "Attached": "Attached", "Appearance": "Appearance", "Image": "Image", "In code": "In code",
  "No Script": "No Script", "Project image": "Project image", "Built-in image": "Built-in image", "No image": "No image",
  "<code>this.transform.position</code> gives x and y; <code>this.gameObject.tag</code> is the tag; <code>this.gameObject.w</code> / <code>h</code> give the box size.": "<code>this.transform.position</code> gives x and y; <code>this.gameObject.tag</code> is the tag; <code>this.gameObject.w</code> / <code>h</code> give the box size.",
  "Switch to dark theme": "Switch to dark theme", "Switch to light theme": "Switch to light theme",
  "Code editor. Press Escape, then Tab to leave it.": "Code editor. Press Escape, then Tab to leave it.",
  "Add a new Script file": "Add a new Script file", "Name of the new Script (its class name, like Coin):": "Name of the new Script (its class name, like Coin):",
  "This Project uses the saved Level and your Scripts. Open Objects to inspect the current game, or 🗺 Level to edit the starting boxes.": "This Project uses the saved Level and your Scripts. Open Objects to inspect the current game, or 🗺 Level to edit the starting boxes.",
  "Compare {name}.ts": "Compare {name}.ts", "Next Lesson ▶": "Next Lesson ▶",
  "Retry Level": "Retry Level",
  "Achievements {earned} / {total}": "Achievements {earned} / {total}", "Achievement unlocked": "Achievement unlocked",
  "Done: ": "Done: ", "To do: ": "To do: ", "Fix the red squiggles before running.": "Fix the red squiggles before running.",
  "Fix the code errors below, then Run again.": "Fix the code errors below, then Run again.",
  "Click to play": "Click to play", "✓ Lesson passed": "✓ Lesson passed", "Lesson passed": "Lesson passed",
  "🔓 Sandbox and Chapter 2 unlocked": "🔓 Sandbox and Chapter 2 unlocked",
  "Your code ran forever. Look at your while / for loops.": "Your code ran forever. Look at your while / for loops.",
  "Storage is full: your last Project change was not saved. Delete a Project you no longer need and try again.": "Storage is full: your last Project change was not saved. Delete a Project you no longer need and try again.",
  "Project name:": "Project name:", "Delete \"{name}\"? Its Scripts are gone for good.": "Delete \"{name}\"? Its Scripts are gone for good.",
  "Smaller code": "Smaller code", "Reset code size": "Reset code size", "Bigger code": "Bigger code",
  "Language": "Language",
  "A Script name starts with a capital letter and has only letters, digits and _, like Coin.": "A Script name starts with a capital letter and has only letters, digits and _, like Coin.",
  "There is already a {name}.ts.": "There is already a {name}.ts.",
  "{name} is part of the engine API. Pick another name.": "{name} is part of the engine API. Pick another name.",
  "Images can't be saved in this browser right now. Reload the page and try again.": "Images can't be saved in this browser right now. Reload the page and try again.",
  "Projects with images can't be saved in this browser right now. Reload the page and try again.": "Projects with images can't be saved in this browser right now. Reload the page and try again.",
  "This file can't be opened: it isn't a learn-dev Project file.": "This file can't be opened: it isn't a learn-dev Project file.",
  "Camera start saved: Run starts the camera here": "Camera start saved: Run starts the camera here",
  "Level code copied": "Level code copied", "Copying didn't work: the code is selected, press Ctrl/Cmd+C.": "Copying didn't work: the code is selected, press Ctrl/Cmd+C.",
  "Reset to default": "Reset to default", "Remove image": "Remove image", "+ New Script…": "+ New Script…", "+ New tag…": "+ New tag…", "(none)": "(none)",
  "Add a {tag}: press, or drag it into the view": "Add a {tag}: press, or drag it into the view",
  "This file can't be opened: it isn't a learn-dev backup or Project file.": "This file can't be opened: it isn't a learn-dev backup or Project file.",
  "This file can't be opened: it comes from a newer learn-dev. Reload the page and try again.": "This file can't be opened: it comes from a newer learn-dev. Reload the page and try again.",
  "Adds the Project \"{name}\". Nothing here is overwritten.": "Adds the Project \"{name}\". Nothing here is overwritten.",
  "Adds {items}. Nothing here is overwritten.": "Adds {items}. Nothing here is overwritten.",
  "Everything in this file is already here. Nothing changes.": "Everything in this file is already here. Nothing changes.",
  "today": "today", "{days} ago": "{days} ago", "never": "never",
  "💾 You've never backed up your saves": "💾 You've never backed up your saves", "💾 Your last backup was {when}": "💾 Your last backup was {when}",
  "+ Script": "+ Script", "Run ({shortcut})": "Run ({shortcut})",
  "{progress} Lessons passed, back to Lessons": "{progress} Lessons passed, back to Lessons",
  "{earned} earned · gold = earned · grey = can earn now · ? = earn the one before it first": "{earned} earned · gold = earned · grey = can earn now · ? = earn the one before it first",
  "DeepSeek should have the prompt in its box, unsent. Add your question after `My question:`. If the box is empty, paste it (Ctrl/Cmd+V).": "DeepSeek should have the prompt in its box, unsent. Add your question after `My question:`. If the box is empty, paste it (Ctrl/Cmd+V).",
  "This prompt can't fit in a DeepSeek link, so it's copied. Paste it into DeepSeek (Ctrl/Cmd+V), then add your question.": "This prompt can't fit in a DeepSeek link, so it's copied. Paste it into DeepSeek (Ctrl/Cmd+V), then add your question.",
  "You need a free DeepSeek account.": "You need a free DeepSeek account.",
  "Back to Project": "Back to Project", "Back to Projects": "Back to Projects",
  "▶ Running {target}…": "▶ Running {target}…",
  "Ch. 2 {done} / {total}": "Ch. 2 {done} / {total}",
  "Chapter 2: {done} of {total} Lessons passed": "Chapter 2: {done} of {total} Lessons passed",
  "{earned} of {achievements} Achievements, Chapter 1: {done} of {total} Lessons passed{chapterTwo}": "{earned} of {achievements} Achievements, Chapter 1: {done} of {total} Lessons passed{chapterTwo}",
  "This file can't be opened: {why}.": "This file can't be opened: {why}.",
  "it isn't a learn-dev Project file": "it isn't a learn-dev Project file",
  "it comes from a newer learn-dev. Reload the page and try again": "it comes from a newer learn-dev. Reload the page and try again",
  "the Project in it is damaged": "the Project in it is damaged",
  "it has {problem}": "it has {problem}",
  "an image that isn't a PNG": "an image that isn't a PNG", "a broken image": "a broken image",
  "an image bigger than {size}×{size}": "an image bigger than {size}×{size}",
  "Lesson": "Lesson", "Project": "Project",
  "TypeScript vs Unity C#": "TypeScript vs Unity C#",
  "Everything here works like Unity C#, except:": "Everything here works like Unity C#, except:",
  "Extra: no Lesson teaches this. Build it in your own Player code, in any Lesson or a Sandbox Project.": "Extra: no Lesson teaches this. Build it in your own Player code, in any Lesson or a Sandbox Project.",
  "Earn the one before it first": "Earn the one before it first", "✓ earned": "✓ earned",
  "There is no sound named {name}": "There is no sound named {name}",
  "{name}.ts must define class {name} extends MonoBehaviour": "{name}.ts must define class {name} extends MonoBehaviour",
  "There is no Script named {name}": "There is no Script named {name}",
  "This image can't be opened. Try saving it again as a PNG.": "This image can't be opened. Try saving it again as a PNG.",
  "+ New": "+ New", "PROJECT": "PROJECT", "Example:": "Example:", "Differs from Unity C#": "Differs from Unity C#",
} as const;
export type Message = keyof typeof english;
type Slots<S extends string> = S extends `${string}{${infer P}}${infer Rest}` ? P | Slots<Rest> : never;
type Args<S extends string> = [Slots<S>] extends [never] ? [] : [values: Record<Slots<S>, string | number>];

export type Catalog = {
  locale: string;
  messages: Partial<Record<Message, string>>;
  /** Extra CLDR forms for counted messages; absent forms use the English plural. */
  plurals?: Partial<Record<Message, Partial<Record<Intl.LDMLPluralRule, string>>>>;
  /** Canonical English Lesson title is the key. Entries may supply any subset of fields. */
  lessons?: Record<string, Partial<Pick<Lesson, "title" | "concept" | "explanation">> & { hints?: readonly string[]; goals?: readonly string[]; lose?: readonly string[] }>;
  /** Canonical page or API member id is the key; Markdown must preserve code and links. */
  docs?: Record<string, string>;
  achievements?: Record<string, Partial<Pick<Achievement, "title" | "message">>>;
};

const fill = (pattern: string, values: Record<string, string | number>) =>
  pattern.replace(/\{(\w+)\}/g, (match, name: string) => name in values ? String(values[name]) : match);

export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export function createTranslator(catalog: Catalog) {
  const t = <K extends Message>(key: K, ...args: Args<K>) => fill(catalog.messages[key] ?? english[key], (args[0] ?? {}) as Record<string, string | number>);
  const rules = new Intl.PluralRules(catalog.locale);
  return Object.assign(t, {
    count: <O extends Message, M extends Message>(one: O, many: M, count: number) => {
      const form = rules.select(count);
      const key = form === "one" ? one : many;
      return fill(catalog.plurals?.[one]?.[form] ??
        (form === "one" || form === "other" ? catalog.messages[key] : undefined) ?? english[key], { count });
    },
  });
}

export const englishCatalog: Catalog = { locale: "en", messages: english };
/** Add a shipped locale here when its real catalog and learning content are ready. */
export const catalogs: Record<string, Catalog> = { en: englishCatalog, ru: russian };

export function resolveLocale(saved: string | null, browser: string, supported = Object.keys(catalogs)): string {
  for (const candidate of [saved, browser]) {
    if (!candidate) continue;
    const exact = candidate.toLowerCase();
    const match = supported.find((locale) => locale.toLowerCase() === exact);
    if (match) return match;
    const base = exact.split("-")[0];
    const baseMatch = supported.find((locale) => locale.toLowerCase() === base);
    if (baseMatch) return baseMatch;
  }
  return "en";
}

export const setDocumentLocale = (locale: string) => { document.documentElement.lang = locale; };
const savedLocale = () => { try { return localStorage.getItem("locale"); } catch { return null; } };
export const activeLocale = resolveLocale(savedLocale(), typeof navigator === "undefined" ? "en" : navigator.language);
export const activeCatalog = catalogs[activeLocale] ?? englishCatalog;
export const t = createTranslator(activeCatalog);
if (typeof document !== "undefined") setDocumentLocale(activeCatalog.locale);

/** Translate the page's fixed HTML labels once, before screens add dynamic content. */
export function translateStatic(root: ParentNode = document, catalog: Catalog = activeCatalog) {
  if (catalog.locale === "en") return;
  const translate = (source: Message) => catalog.messages[source] ?? english[source];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, svg, code, kbd, [translate='no']")) continue;
    const source = node.textContent?.trim() as Message;
    if (!source || !(source in english)) continue;
    node.textContent = node.textContent!.replace(source, translate(source));
  }
  for (const element of root.querySelectorAll("[aria-label], [title], [placeholder]")) {
    if (element.closest("[translate='no']")) continue;
    for (const attr of ["aria-label", "title", "placeholder"]) {
      const source = element.getAttribute(attr) as Message | null;
      if (source && source in english) element.setAttribute(attr, translate(source));
    }
  }
}

export function localizeLesson<T extends Pick<Lesson, "title" | "concept" | "explanation" | "hints">>(lesson: T, catalog: Catalog = activeCatalog): T {
  const translated = catalog.lessons?.[lesson.title];
  return { ...lesson, title: translated?.title ?? lesson.title, concept: translated?.concept ?? lesson.concept,
    explanation: translated?.explanation ?? lesson.explanation,
    hints: lesson.hints?.map((hint, index) => translated?.hints?.[index] ?? hint) };
}

export const localizeDocs = (id: string, englishMarkdown: string, catalog: Catalog = activeCatalog) =>
  catalog.docs?.[id] ?? englishMarkdown;

export const localizeCheck = (lesson: Pick<Lesson, "title" | "goals" | "lose">, kind: "goals" | "lose", index: number, catalog: Catalog = activeCatalog) =>
  catalog.lessons?.[lesson.title]?.[kind]?.[index] ?? lesson[kind][index]?.message ?? "";

export const localizeAchievement = <T extends Pick<Achievement, "id" | "title" | "message">>(achievement: T, catalog: Catalog = activeCatalog): T =>
  ({ ...achievement, ...catalog.achievements?.[achievement.id] });

/** Engine-owned errors cross the worker boundary as English; student exceptions pass through. */
export function localizeRuntimeError(message: string, catalog: Catalog = activeCatalog): string {
  const tr = createTranslator(catalog);
  let match = /^There is no sound named (.+)$/.exec(message);
  if (match) return tr("There is no sound named {name}", { name: match[1] });
  match = /^(.+)\.ts must define class \1 extends MonoBehaviour$/.exec(message);
  if (match) return tr("{name}.ts must define class {name} extends MonoBehaviour", { name: match[1] });
  match = /^There is no Script named (.+)$/.exec(message);
  return match ? tr("There is no Script named {name}", { name: match[1] }) : message;
}
