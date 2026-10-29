import { describe, expect, it } from "vitest";
import { tutorPrompt, tutorRules } from "./ai-note";

describe("tutorPrompt", () => {
  const prompt = tutorPrompt({
    lesson: {
      title: "5. Jump",
      explanation: "Press Space to jump.",
      goals: [{ message: "Reach the flag", met: false }, { message: "Jump once", met: true }],
      hints: ["Look at Input.GetKeyDown."],
    },
    script: { name: "Player", code: "class Player {}" },
    console: Array.from({ length: 25 }, (_, i) => `line ${i}`),
  });

  it("puts the sections in order and ends with My question:", () => {
    const order = [tutorRules, "5. Jump", "Press Space to jump.", "⬜ Reach the flag", "✓ Jump once",
      "Hint 1: Look at Input.GetKeyDown.", "class Player {}", "line 24"].map((s) => prompt.indexOf(s));
    expect(order.every((at, i) => at >= 0 && (i === 0 || at > order[i - 1]))).toBe(true);
    expect(prompt.trimEnd().endsWith("My question:")).toBe(true);
  });

  it("keeps only the last 20 Console lines", () => {
    expect(prompt).not.toContain("line 4\n");
    expect(prompt).toContain("line 5\n");
  });

  it("in Sandbox says free play instead of a Lesson", () => {
    const sandbox = tutorPrompt({ script: { name: "Game", code: "class Game {}" }, console: [] });
    expect(sandbox).toContain("# Sandbox: free play, no Goals\n\n## My code: Game.ts");
    expect(sandbox).not.toContain("# Lesson");
  });

  it("starts with tutor rules", () => expect(prompt.startsWith("Tutor rules:")).toBe(true));
});
