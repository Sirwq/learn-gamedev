import { describe, expect, it, vi } from "vitest";
import { achievementChecker, achievements, loadEarned, saveEarned, stateOf } from "./achievements";
import type { World } from "./engine";

const at = (x: number): World => [{ tag: "Player", x, y: 40, w: 32, h: 32, color: "" }];

describe("achievements", () => {
  it("is a tree of 18 with one root and no cycles", () => {
    expect(achievements).toHaveLength(18);
    expect(new Set(achievements.map((a) => a.id)).size).toBe(18);
    expect(achievements.filter((a) => !a.after)).toHaveLength(1);
    const byId = new Map(achievements.map((a) => [a.id, a]));
    for (const a of achievements) {
      const path = new Set<string>();
      for (let n: typeof a | undefined = a; n; n = n.after ? byId.get(n.after) : undefined) {
        expect(path.has(n.id)).toBe(false);
        path.add(n.id);
        if (n.after) expect(byId.has(n.after)).toBe(true);
      }
    }
  });

  it("checks only Achievements whose `after` is earned", () => {
    const root = { id: "a", after: null, test: vi.fn(() => false) };
    const next = { id: "b", after: "a", test: vi.fn(() => true) };
    const list = [root, next] as unknown as typeof achievements;
    const check = achievementChecker(at(0), new Set(), list);
    expect(check(at(0))).toEqual([]);
    expect(root.test).toHaveBeenCalled();
    expect(next.test).not.toHaveBeenCalled();

    const earned = new Set(["a"]);
    expect(achievementChecker(at(0), earned, list)(at(0))).toEqual(["b"]);
    expect(root.test).toHaveBeenCalledTimes(1); // earned ones aren't checked again
    expect(earned.has("b")).toBe(true);
  });

  it("earns First steps when the Player moves, and Both ways only after left and right in one Run", () => {
    const earned = new Set<string>();
    const check = achievementChecker(at(100), earned);
    expect(check(at(100))).toEqual([]);
    expect(check(at(110))).toEqual(["steps"]);
    expect(check(at(105))).toEqual([]); // Both ways was hidden on the frame that went right
    expect(check(at(115))).toEqual(["both"]);
  });

  it("shows earned, locked and hidden tiles", () => {
    const earned = new Set(["steps"]);
    const byId = (id: string) => achievements.find((a) => a.id === id)!;
    expect(stateOf(byId("steps"), earned)).toBe("earned");
    expect(stateOf(byId("fall"), earned)).toBe("locked");
    expect(stateOf(byId("jump"), earned)).toBe("hidden");
  });

  it("saves earned Achievements", () => {
    const data: Record<string, string> = {};
    const store = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) };
    saveEarned("steps", store);
    expect(loadEarned(store)).toEqual(new Set(["steps"]));
  });
});
