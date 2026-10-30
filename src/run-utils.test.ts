import { describe, expect, it } from "vitest";
import { codeErrorLines, errorLine, modKey, runShortcut, runStartLine, transpile, v2Features } from "./run-utils";

describe("Run code errors", () => {
  it("names every broken Script and its line, including chained TypeScript messages", () => {
    expect(codeErrorLines([
      { script: "Player", line: 3, column: 7, message: "Expression expected." },
      { script: "Enemy", line: 8, column: 2, message: { messageText: "Type mismatch", next: [{ messageText: "Expected number" }] } },
    ])).toEqual([
      { level: "error", text: "Player.ts:3:7 Expression expected.", count: 1 },
      { level: "error", text: "Enemy.ts:8:2 Type mismatch Expected number", count: 1 },
    ]);
  });
});

describe("transpile", () => {
  it("strips types and keeps every line on the same line number", () => {
    const ts = [
      "interface P { x: number }",
      "",
      "type Q = P;",
      "export function update(dt: number): void {",
      "  const p: P = { x: dt };",
      "  throw new Error('boom ' + p.x);",
      "}",
    ].join("\n");
    const lines = transpile(ts).split("\n");
    expect(lines).toHaveLength(7);
    expect(lines[5]).toContain("throw new Error");
    expect(lines.join("\n")).not.toContain(": number");
  });
});

describe("errorLine", () => {
  it("reads line and column from the first blob frame (Chrome)", () => {
    const stack = "Error: boom\n    at update (blob:http://localhost:5173/abc-123:6:9)\n    at loop (http://localhost:5173/src/runner.worker.ts:20:5)";
    expect(errorLine(stack)).toEqual({ url: "blob:http://localhost:5173/abc-123", line: 6, col: 9 });
  });
  it("reads Firefox/Safari style frames", () => {
    expect(errorLine("update@blob:http://localhost:5173/abc-123:12:3\nloop@http://x/w.js:1:1")).toEqual({ url: "blob:http://localhost:5173/abc-123", line: 12, col: 3 });
  });
  it("returns undefined when no blob frame exists", () => {
    expect(errorLine("Error\n    at http://x/w.js:1:1")).toBeUndefined();
    expect(errorLine(undefined)).toBeUndefined();
  });
});

describe("Run button", () => {
  it("shows the shortcut with the platform's symbols", () => {
    expect(runShortcut("MacIntel")).toBe("⌘↵");
    expect(runShortcut("iPad")).toBe("⌘↵");
    expect(runShortcut("Win32")).toBe("Ctrl+↵");
    expect(runShortcut("Linux x86_64")).toBe("Ctrl+↵");
  });
  it("names the Lesson by number, a Project by its name", () => {
    expect(runStartLine(0)).toBe("▶ Running Lesson 1…");
    expect(runStartLine(14)).toBe("▶ Running Lesson 15…");
    expect(runStartLine(3, "My world")).toBe("▶ Running My world…");
  });
});

describe("modKey", () => {
  it("is ⌘ on Apple platforms and Ctrl+ elsewhere", () => {
    expect(modKey("MacIntel")).toBe("⌘");
    expect(modKey("Win32")).toBe("Ctrl+");
  });
});

describe("Chapter 2 features", () => {
  it("keeps Lessons 1–15 silent and enables sound, labels and animation after them", () => {
    expect(v2Features({ lesson: 14 })).toBe(false);
    expect(v2Features({ lesson: 15 })).toBe(true);
    expect(v2Features({ level: {} })).toBe(true);
  });
});
