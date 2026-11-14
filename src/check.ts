import { Time, type Clip, type Label, type World } from "./engine";
import type { ConsoleLine } from "./console";
import type { Lesson } from "./lesson";

export const CHAPTER_ONE_COUNT = 15;
export const CHAPTER_TWO_COUNT = 6;

/** Chapter 2 and Sandbox open together, regardless of later Chapter 2 progress. */
export const chapterTwoUnlocked = (lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) =>
  lessons.length >= CHAPTER_ONE_COUNT && isPassed(lessons[CHAPTER_ONE_COUNT - 1].title, store);

export function chapterProgress(lessons: Pick<Lesson, "title">[], store: Pick<Storage, "getItem"> = localStorage) {
  const done = progress(lessons, store);
  return { chapterOne: done.slice(0, CHAPTER_ONE_COUNT).filter(Boolean).length,
    chapterTwo: done.slice(CHAPTER_ONE_COUNT).filter(Boolean).length,
    unlocked: chapterTwoUnlocked(lessons, store) };
}

export type CheckResult = { met: boolean[]; passed: boolean; lost?: string };

/** A read-only frame for Lesson Goals. These fields are not part of the student API. */
export type CheckWorld = World & { readonly logs: readonly Readonly<ConsoleLine>[]; readonly keysDown: ReadonlySet<string>; readonly sounds: readonly Clip[]; readonly labels: readonly Readonly<Label>[] };
export type CheckFrame = { logs?: readonly ConsoleLine[]; keysDown?: ReadonlySet<string>; sounds?: readonly Clip[]; labels?: readonly Label[] };

/** One per Run: call every frame. A Goal stays ✓ for the rest of the Run; a Lose event resets them all. No Goals (Sandbox) never passes. */
export function checker({ goals, lose }: Pick<Lesson, "goals" | "lose">) {
  const met = goals.map(() => false);
  let frames = 0;
  return (world: World, frame: CheckFrame = {}): CheckResult => {
    const view: CheckWorld = Object.assign([...world], {
      logs: (frame.logs ?? []).map(line => ({ ...line })),
      keysDown: new Set(frame.keysDown ?? []),
      sounds: [...(frame.sounds ?? [])],
      labels: (frame.labels ?? []).map((label) => ({ ...label })),
    });
    const time = ++frames * Time.deltaTime;
    const lost = lose.find((l) => l.test(view, time));
    if (lost) return { met: met.fill(false).slice(), passed: false, lost: lost.message };
    goals.forEach((g, i) => (met[i] ||= g.test(view, time)));
    return { met: met.slice(), passed: met.length > 0 && met.every(Boolean) };
  };
}

// Keyed by title: a pass stays saved even if later code breaks it.
const key = (title: string) => `passed:${title}`;
export function markPassed(title: string, store: Pick<Storage, "setItem"> = localStorage) {
  store.setItem(key(title), "1");
  store.setItem("saves:changed", String(Date.now())); // the backup reminder sees something new
}
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
