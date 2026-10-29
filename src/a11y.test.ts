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
