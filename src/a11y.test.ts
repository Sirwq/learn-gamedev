import html from "../index.html?raw";
import { describe, expect, it } from "vitest";

const tag = (id: string) => html.match(new RegExp(`<[a-z]+ id="${id}"[^>]*>`))?.[0] ?? "";

describe("Lesson page accessibility", () => {
  it("is a dark page in the browser chrome too", () => {
    expect(html).toContain('<html lang="en" style="color-scheme: dark">');
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
  it("gives the menu buttons the header's focus ring", () => expect(html).toContain("#menu .bar button:focus-visible { outline: 2px solid #9cf;"));
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
