import { describe, expect, it } from "vitest";
import { addLine, clearLines, type ConsoleLine, lineText, MAX_LINES } from "./console";
import { Debug, logs, Vector2 } from "./engine";

describe("Console lines", () => {
  it("collapses identical consecutive lines into one with a count", () => {
    const lines: ConsoleLine[] = [];
    for (let i = 0; i < 120; i++) addLine(lines, "log", "coins: 3");
    addLine(lines, "warn", "coins: 3");
    addLine(lines, "log", "coins: 3");
    expect(lines.map(lineText)).toEqual(["coins: 3 ×120", "coins: 3", "coins: 3"]);
    expect(lines.map((l) => l.level)).toEqual(["log", "warn", "log"]);
  });
  it("keeps only the last 500 lines", () => {
    const lines: ConsoleLine[] = [];
    for (let i = 0; i < MAX_LINES + 20; i++) addLine(lines, "log", `n ${i}`);
    expect(lines).toHaveLength(500);
    expect(lines[0].text).toBe("n 20");
    expect(lines.at(-1)!.text).toBe("n 519");
  });
  it("clears on Run, so a repeat after Run starts a new count", () => {
    const lines: ConsoleLine[] = [];
    addLine(lines, "log", "hi");
    addLine(lines, "log", "hi");
    clearLines(lines);
    expect(lines).toEqual([]);
    addLine(lines, "log", "hi");
    expect(lines.map(lineText)).toEqual(["hi"]);
  });
  it("merges a batch from the worker into the last line's count", () => {
    const lines: ConsoleLine[] = [];
    addLine(lines, "log", "x", 3);
    addLine(lines, "log", "x", 2);
    expect(lines.map(lineText)).toEqual(["x ×5"]);
  });
});

describe("Debug", () => {
  it("queues each call with its level for the worker to send", () => {
    logs.length = 0;
    Debug.Log(new Vector2(1, 2));
    Debug.Log(new Vector2(1, 2));
    Debug.LogWarning("careful");
    Debug.LogError(42);
    expect(logs.splice(0)).toEqual([
      { level: "log", text: "(1, 2)", count: 2 },
      { level: "warn", text: "careful", count: 1 },
      { level: "error", text: "42", count: 1 },
    ]);
  });
});
