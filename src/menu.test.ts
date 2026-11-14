// @vitest-environment jsdom
import html from "../index.html?raw";
import { beforeEach, expect, it, vi } from "vitest";
import { russian } from "./ru";
import { courseMenu } from "./menu";
import { course } from "./lessons/course";
import { markPassed } from "./check";
import { setDocumentLocale, translateStatic } from "./i18n";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = html.split("<body>")[1].split("</body>")[0];
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("BroadcastChannel", class { onmessage = null; });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage() {} } as unknown as CanvasRenderingContext2D);
  setDocumentLocale("en");
});

function open() {
  const menu = courseMenu({ lessonIndex: 0, project: undefined, projects: [], askedProject: null,
    earned: new Set(), images: new Promise(() => {}), focusEditor() {}, refreshDocs() {} });
  menu.openMenu();
  return menu;
}

it("shows all 21 lessons and explains the locked second chapter without navigating", () => {
  open();
  expect(document.querySelectorAll("#rail .cover")).toHaveLength(21);
  expect(document.querySelector(".chapter-label")!.textContent).toBe("🔒 Chapter 2");
  (document.querySelectorAll<HTMLButtonElement>("#menu-dots button")[15]).click();
  expect(document.querySelector("#card-meta")!.textContent).toContain("Pass Lesson 15 to unlock");
  expect(document.querySelector("#menu-play b")!.textContent).toBe("How to unlock");
  document.getElementById("menu-play")!.click();
  expect(location.search).toBe("");
  expect(document.getElementById("menu")!.hidden).toBe(false);
  document.getElementById("course-start")!.click();
  expect(document.getElementById("menu")!.hidden).toBe(true);
});

it("refreshes chapter locks and the continue action after passing lesson 15", () => {
  const menu = open();
  course.slice(0, 15).forEach(l => markPassed(l.title));
  menu.openMenu();
  expect(document.querySelector(".chapter-label")!.textContent).toBe("Chapter 2");
  expect(document.getElementById("course-continue")!.textContent).toBe("Continue Lesson 16");
  expect(document.querySelectorAll("#rail .cover")[15].classList.contains("current")).toBe(true);
  expect(document.querySelectorAll("#rail .cover")[16].classList.contains("locked")).toBe(true);
  menu.setMode("sandbox");
  expect(document.getElementById("course-intro")!.hidden).toBe(true);
});

it("translates the course overview into Russian", () => {
  setDocumentLocale("ru");
  translateStatic(document, russian);
  open();
  expect(document.getElementById("course-intro")!.textContent).toContain("21 урок · 2 главы");

});
