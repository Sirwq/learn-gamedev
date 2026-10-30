// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createTranslator, escapeHtml, resolveLocale, localizeLesson, localizeCheck, localizeDocs, localizeRuntimeError, setDocumentLocale, translateStatic } from "./i18n";
import { markPassed, isPassed } from "./check";
import { saveOpenedHints, openedHints, saveSnapshot, snapshot } from "./lesson";
import { loadProject, saveProject } from "./project-storage";

const fixture = {
  locale: "xx",
  messages: {
    "Run": "Cours",
    "Hint {number} of {total}": "Indice {number} sur {total}",
    "{count} line": "{count} ligne",
    "{count} lines": "{count} lignes",
    "There is no Script named {name}": "Script {name} introuvable",
  },
  lessons: { "01. Move": { title: "01. Bouger", concept: "Bouger", explanation: "See [API](#doc-GameObject). `Move()`", hints: ["Indice"], goals: ["Objectif"] } },
  docs: { Sandbox: "Voir [GameObject](#doc-GameObject).\n\n```ts\nconst x = 1;\n```" },
} as const;

describe("translation seam", () => {
  it("looks up messages, fills placeholders, selects plurals and falls back to English", () => {
    const t = createTranslator(fixture);
    expect(t("Run")).toBe("Cours");
    expect(t("Hint {number} of {total}", { number: 1, total: 3 })).toBe("Indice 1 sur 3");
    expect(t.count("{count} line", "{count} lines", 2)).toBe("2 lignes");
    expect(t("Stop")).toBe("Stop");
    const ru = createTranslator({ locale: "ru", messages: { "{count} Project": "{count} проект" },
      plurals: { "{count} Project": { few: "{count} проекта", many: "{count} проектов" } } });
    expect([1, 2, 5, 21].map((n) => ru.count("{count} Project", "{count} Projects", n)))
      .toEqual(["1 проект", "2 проекта", "5 проектов", "21 проект"]);
  });
  it("uses only supported locales and sets the document language", () => {
    expect(resolveLocale("xx", "en-US", ["en", "xx"])).toBe("xx");
    expect(resolveLocale("zz", "xx-YY", ["en", "xx"])).toBe("xx");
    expect(resolveLocale("zz", "fr-FR", ["en", "xx"])).toBe("en");
    expect(resolveLocale("PT-br", "en", ["en", "pt-BR"])).toBe("pt-BR");
    document.documentElement.lang = "en";
    setDocumentLocale("xx");
    expect(document.documentElement.lang).toBe("xx");
  });
  it("translates fixed page text and accessible names without touching code", () => {
    const root = document.createElement("div");
    root.innerHTML = '<button aria-label="Run">Run</button><code>Run</code>';
    translateStatic(root, fixture);
    expect(root.querySelector("button")!.textContent).toBe("Cours");
    expect(root.querySelector("button")!.ariaLabel).toBe("Cours");
    expect(root.querySelector("code")!.textContent).toBe("Run");
  });
  it("localizes engine errors while leaving student exceptions intact", () => {
    expect(localizeRuntimeError("There is no Script named Enemy", fixture)).toBe("Script Enemy introuvable");
    expect(localizeRuntimeError("my custom exception", fixture)).toBe("my custom exception");
  });
  it("escapes translated achievement text before it enters HTML attributes", () => {
    expect(escapeHtml('A "quote" & <tag>')).toBe('A &quot;quote&quot; &amp; &lt;tag&gt;');
  });
  it("falls back by content field and keeps canonical keys", () => {
    const lesson = { title: "01. Move", concept: "Move", explanation: "English", hints: ["First", "Second"], scripts: {}, goals: [], lose: [], level: { boxes: [] } };
    const shown = localizeLesson(lesson, fixture);
    expect(shown.title).toBe("01. Bouger");
    expect(shown.hints).toEqual(["Indice", "Second"]);
    expect(localizeDocs("Sandbox", "English", fixture)).toContain("[GameObject](#doc-GameObject)");
    expect(localizeDocs("Unknown", "English", fixture)).toBe("English");
    expect(localizeCheck({ title: lesson.title, goals: [{ message: "Goal", test: () => false }], lose: [] }, "goals", 0, fixture)).toBe("Objectif");
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v); } };
    markPassed(lesson.title, storage);
    saveOpenedHints(lesson.title, 1, storage);
    saveSnapshot(lesson.title, { Player: "code" }, storage);
    expect(isPassed(lesson.title, storage)).toBe(true);
    expect(openedHints(lesson.title, storage)).toBe(1);
    expect(snapshot(lesson.title, storage)).toEqual({ Player: "code" });
    expect([...store.keys()]).toContain("passed:01. Move");
    expect([...store.keys()]).not.toContain("passed:01. Bouger");
  });
  it("keeps a Sandbox Project's id and storage key with an alternate display locale", async () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    const project = { id: "stable123", name: "My Project", scripts: { Player: "class Player {}" }, level: { boxes: [] } };
    await saveProject(project, storage);
    expect((await loadProject("stable123", storage))?.project).toEqual(project);
    expect(values.has("sandbox:projects")).toBe(true);
    expect(values.has("project:01. Bouger")).toBe(false);
  });
});
