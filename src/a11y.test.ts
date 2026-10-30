import html from "../index.html?raw";
import mainTs from "./main.ts?raw";
import menuTs from "./menu.ts?raw";
import { describe, expect, it } from "vitest";

// The page's own code, wherever it lives.
const main = mainTs + menuTs;

const tag = (id: string) => html.match(new RegExp(`<[a-z]+ id="${id}"[^>]*>`))?.[0] ?? "";

describe("Lesson page accessibility", () => {
  it("tells the browser chrome which theme is on", () => {
    expect(html).toContain('color-scheme: dark;');
    expect(html).toContain(':root[data-theme="light"] {\n        color-scheme: light;');
    expect(html).toContain('<meta name="theme-color" content="#1e1e1e" />');
  });
  it("names icon-only buttons", () => {
    expect(tag("compare-close")).toContain('aria-label="Close"');
  });
  it("labels the way back to the Course menu in words, not a ☰ glyph", () => {
    expect(tag("menu-open")).toContain('aria-label="Back to Lessons"');
    expect(tag("menu-open")).toContain('title="Back to Lessons"');
    expect(html).not.toContain("☰");
  });
  it("keeps hidden Course menu buttons hidden (the bar's display: flex must not beat [hidden])", () =>
    expect(html).toContain("#menu .bar button[hidden] { display: none; }"));
  it("gives the Console a role that allows its label", () => expect(tag("console")).toContain('role="log"'));
  it("lets the progress name come from code, holding the visible count", () => expect(tag("progress")).not.toContain("aria-label"));
});

describe("Course menu accessibility", () => {
  it("has a heading for screen readers", () => expect(html).toContain('<h1 id="menu-heading" class="sr-only">Choose a Lesson</h1>'));
  it("announces the focused card in a polite live region", () => expect(tag("menu-live")).toContain('aria-live="polite"'));
  it("hides the key hints and puts the shortcuts on the buttons", () => {
    expect(html).not.toMatch(/<kbd>(Q|E|Esc|A|Enter)<\/kbd>/);
    expect(tag("chip-course")).toContain('aria-keyshortcuts="Q"');
    expect(tag("chip-sandbox")).toContain('aria-keyshortcuts="E"');
    expect(tag("menu-back")).toContain('aria-keyshortcuts="Escape"');
    expect(tag("menu-achievements")).toContain('aria-keyshortcuts="A"');
    expect(tag("menu-play")).toContain('aria-keyshortcuts="Enter"');
  });
  it("gives the menu buttons the header's focus ring", () => expect(html).toContain("#menu .bar button:focus-visible { outline: 2px solid var(--focus);"));
  it("uses tabular numbers in the stats", () => expect(html).toMatch(/#menu-stats \{[^}]*tabular-nums/));
});

describe("Course menu pointer navigation", () => {
  it("has labelled previous / next buttons", () => {
    expect(tag("menu-prev")).toContain('aria-label="Previous Lesson"');
    expect(tag("menu-next")).toContain('aria-label="Next Lesson"');
  });
  it("replaces the 1 / 15 count with a group of dots", () => expect(tag("menu-dots")).toContain('role="group"'));
  it("gives coarse pointers 44 px targets", () => expect(html).toMatch(/@media \(pointer: coarse\) \{[^@]*min-height: 44px/));
});

describe("Course menu motion", () => {
  const cover = html.match(/\n\s*\.cover \{[^}]*\}/)?.[0] ?? "";
  it("moves cards with transforms, not layout properties", () => {
    expect(cover).toMatch(/transition: translate [^;]*, scale /);
    expect(cover).not.toMatch(/transition:[^;]*\b(left|top|width|height)\b/);
  });
  it("sizes cards in CSS, so resizing needs no JS measuring", () => {
    expect(cover).toContain("aspect-ratio: 3 / 4");
    expect(main).not.toContain("clientWidth");
    expect(main).not.toContain('addEventListener("resize"');
  });
  it("stops sliding under reduced motion", () => {
    expect(html).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\.cover \{ transition: none; \}[^@]*animation-name: toast-fade/);
    expect(main).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
  });
  it("cancels a running tab slide before starting the next", () => expect(main).toMatch(/getAnimations\(\)[^\n]*cancel\(\)/));
});

describe("Course menu on small screens", () => {
  it("uses the device width and keeps zoom", () => {
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    expect(html).not.toMatch(/user-scalable|maximum-scale/);
  });
  it("wraps the bars and drops key hints on touch screens", () => {
    expect(html).toMatch(/#menu \.bar \{[^}]*flex-wrap: wrap/);
    expect(html).toMatch(/@media \(pointer: coarse\) \{[^@]*#menu kbd \{ display: none; \}/);
  });
  it("turns Back and Achievements into named icon buttons and Play into a full-width button when narrow", () => {
    expect(tag("menu-back")).toContain('aria-label="Back to Lesson"');
    expect(tag("menu-achievements")).toContain('aria-label="Achievements"');
    expect(html).toMatch(/@media \(max-width: 900px\) \{[^@]*#menu-play \{[^}]*flex-basis: 100%/);
  });
  it("keeps both bars clear of the notch", () => {
    expect(html).toMatch(/#menu \.bar \{[^}]*env\(safe-area-inset-left\)[^}]*env\(safe-area-inset-right\)/);
    expect(html).toContain("env(safe-area-inset-top)");
    expect(html).toContain("env(safe-area-inset-bottom)");
  });
  it("shows a dismissible 'works best on a computer' note on phones only", () => {
    expect(tag("menu-phone")).toContain('role="note"');
    expect(html).toMatch(/#menu-phone \{ display: none; \}\s*@media \(max-width: 599px\)/);
    expect(main).toMatch(/menu-phone[^\n]*\n[^\n]*remove\(\)/);
    expect(html).not.toContain(".bar:first-of-type"); // the note is a div before the bar
    expect(html).toMatch(/#menu-phone ~ \.bar:not\(\.bottom\) \{ top: calc/);
  });
  it("says what every menu control does without a tooltip", () => {
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>C#/); // a disabled button can't be hovered or focused
    expect(html).toContain("C# — coming later");
    expect(main).toContain('KeyE: () => (chipSandbox.hidden ? toast(t("Sandbox opens when you finish the Course"))');
    expect(main).toContain('t("Back to Lesson {number}", { number: lessonIndex + 1 })');
    expect(main).not.toContain('"Locked"');
    expect(main.match(/t\("Pass Lesson \{number\} to unlock", \{ number: menuCurrent \+ 1 \}\)/g)).toHaveLength(2); // the Play toast and the line under the title
  });
  it("shows no minimap in the code editor or Compare, and no overview ruler as a second scrollbar", () => {
    expect(main.match(/minimap: \{ enabled: false \}/g)).toHaveLength(2);
    expect(main).toContain("renderOverviewRuler: false");
  });
});
