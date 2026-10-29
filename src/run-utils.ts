import { transform } from "sucrase";

// Sucrase keeps line N of the TS on line N of the JS, so stack lines are editor lines.
export function transpile(ts: string): string {
  return transform(ts, { transforms: ["typescript"] }).code;
}

export function errorLine(stack: string | undefined): { url: string; line: number; col: number } | undefined {
  const m = stack?.match(/(blob:[^\s)]*):(\d+):(\d+)/);
  return m ? { url: m[1], line: Number(m[2]), col: Number(m[3]) } : undefined;
}

/** Monaco's CtrlCmd: ⌘ on Apple platforms, Ctrl elsewhere. */
export const modKey = (platform: string) => (/Mac|iPhone|iPad/.test(platform) ? "⌘" : "Ctrl+");

/** Ctrl+Enter runs. */
export const runShortcut = (platform: string) => `${modKey(platform)}↵`;

/** The one Console line each Run starts with. */
export const runStartLine = (lessonIndex: number, projectName?: string) =>
  `▶ Running ${projectName ?? `Lesson ${lessonIndex + 1}`}…`;
