import type { World } from "./engine";
import type { Lesson } from "./lesson";

export type CheckResult = { met: boolean[]; passed: boolean; lost?: string };

/** One per Run: call every frame. A Goal stays ✓ for the rest of the Run; a Lose event resets them all. */
export function checker({ goals, lose }: Pick<Lesson, "goals" | "lose">) {
  const met = goals.map(() => false);
  return (world: World): CheckResult => {
    const lost = lose.find((l) => l.test(world));
    if (lost) return { met: met.fill(false).slice(), passed: false, lost: lost.message };
    goals.forEach((g, i) => (met[i] ||= g.test(world)));
    return { met: met.slice(), passed: met.every(Boolean) };
  };
}

// Keyed by title: a pass stays saved even if later code breaks it.
const key = (title: string) => `passed:${title}`;
export const markPassed = (title: string, store: Pick<Storage, "setItem"> = localStorage) => store.setItem(key(title), "1");
export const isPassed = (title: string, store: Pick<Storage, "getItem"> = localStorage) => store.getItem(key(title)) === "1";
