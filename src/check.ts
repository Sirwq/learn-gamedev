import { Time, type World } from "./engine";
import type { Lesson } from "./lesson";

export type CheckResult = { met: boolean[]; passed: boolean; lost?: string };

/** One per Run: call every frame. A Goal stays ✓ for the rest of the Run; a Lose event resets them all. */
export function checker({ goals, lose }: Pick<Lesson, "goals" | "lose">) {
  const met = goals.map(() => false);
  let frames = 0;
  return (world: World): CheckResult => {
    const time = ++frames * Time.deltaTime;
    const lost = lose.find((l) => l.test(world, time));
    if (lost) return { met: met.fill(false).slice(), passed: false, lost: lost.message };
    goals.forEach((g, i) => (met[i] ||= g.test(world, time)));
    return { met: met.slice(), passed: met.every(Boolean) };
  };
}

// Keyed by title: a pass stays saved even if later code breaks it.
const key = (title: string) => `passed:${title}`;
export const markPassed = (title: string, store: Pick<Storage, "setItem"> = localStorage) => store.setItem(key(title), "1");
export const isPassed = (title: string, store: Pick<Storage, "getItem"> = localStorage) => store.getItem(key(title)) === "1";

/** One flag per Lesson, true if passed: the top bar's progress pips. */
export const progress = (lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) =>
  lessons.map((l) => isPassed(l.title, store));

/** Lessons unlock in order: Lesson 1, then each one after the one before it is passed. */
export const unlocked = (lessons: Pick<Lesson, "title">[], index: number, store: Pick<Storage, "getItem"> = localStorage) =>
  index === 0 || (index > 0 && index < lessons.length && isPassed(lessons[index - 1].title, store));

/** A Script's Reference code from the latest passed Lesson that has it; undefined until one is passed. */
export const referenceFor = (lessons: Pick<Lesson, "title" | "scripts">[], script: string, store: Pick<Storage, "getItem"> = localStorage) =>
  [...lessons].reverse().find((l) => script in l.scripts && isPassed(l.title, store))?.scripts[script].reference;

/** The Lesson the student is up to: the first one not passed, else the last. */
export function currentLesson(lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) {
  const i = progress(lessons, store).indexOf(false);
  return i < 0 ? lessons.length - 1 : i;
}

export type CardState = "passed" | "current" | "locked";
/** The Course menu's card states, one per Lesson. */
export const cardStates = (lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage): CardState[] =>
  progress(lessons, store).map((passed, i) => (passed ? "passed" : unlocked(lessons, i, store) ? "current" : "locked"));
