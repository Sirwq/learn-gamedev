import { expect, test } from "vitest";
import { limitWaitMs, preservedWorktree } from "./limit";

const min = 60_000;
const now = new Date("2026-10-29T12:00:00Z");

test("ignores other errors", () => {
  expect(limitWaitMs("codex exited with code 1: boom", now)).toBeNull();
});

test("unix timestamp form", () => {
  const reset = now.getTime() / 1000 + 3600;
  expect(limitWaitMs(`Claude AI usage limit reached|${reset}`, now)).toBe(65 * min);
});

test("clock time with timezone", () => {
  expect(limitWaitMs("You've hit your limit · resets 3pm (UTC)", now)).toBe(185 * min);
  expect(limitWaitMs("5-hour limit reached ∙ resets 2:30pm (Europe/Paris)", now)).toBe(95 * min); // Paris is UTC+1 on this date, so 13:00 → 14:30
});

test("reset time already passed today rolls to tomorrow", () => {
  expect(limitWaitMs("You've hit your limit · resets 11am (UTC)", now)).toBe((23 * 60 + 5) * min);
});

test("unreadable reset time falls back to an hour", () => {
  expect(limitWaitMs("usage limit reached", now)).toBe(60 * min);
  expect(limitWaitMs("You've hit your usage limit. Try again at 2:25 AM.", now)).toBe(60 * min);
});

test("finds preserved worktrees on Sandcastle errors", () => {
  const inner = { preservedWorktreePath: "/work/reviewer" };
  expect(preservedWorktree(inner)).toBe("/work/reviewer");
  expect(preservedWorktree({ [Symbol.for("effect/Runtime/FiberFailure/Cause")]: { _tag: "Fail", error: inner } })).toBe("/work/reviewer");
  expect(preservedWorktree(new Error("clean run failed"))).toBeUndefined();
});
