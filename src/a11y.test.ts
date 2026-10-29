import html from "../index.html?raw";
import { describe, expect, it } from "vitest";

const tag = (id: string) => html.match(new RegExp(`<[a-z]+ id="${id}"[^>]*>`))?.[0] ?? "";

describe("Lesson page accessibility", () => {
  it("is a dark page in the browser chrome too", () => {
    expect(html).toContain('<html lang="en" style="color-scheme: dark">');
    expect(html).toContain('<meta name="theme-color" content="#1e1e1e" />');
  });
  it("names icon-only buttons", () => {
    expect(tag("menu-open")).toContain('aria-label="Course menu"');
    expect(tag("compare-close")).toContain('aria-label="Close"');
  });
  it("gives the Console a role that allows its label", () => expect(tag("console")).toContain('role="log"'));
  it("lets the progress name come from code, holding the visible count", () => expect(tag("progress")).not.toContain("aria-label"));
});
