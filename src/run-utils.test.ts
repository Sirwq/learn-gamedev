import { describe, expect, it } from "vitest";
import { errorLine, transpile } from "./run-utils";

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
