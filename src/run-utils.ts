import { transform } from "sucrase";
import { t } from "./i18n";
import type { ConsoleLine } from "./console";

type DiagnosticMessage = string | { messageText: string; next?: DiagnosticMessage[] };
export type CodeError = { script: string; line: number; column: number; message: DiagnosticMessage };

export function codeErrorLines(errors: CodeError[]): ConsoleLine[] {
  const message = (part: DiagnosticMessage): string => typeof part === "string" ? part :
    [part.messageText, ...(part.next ?? []).map(message)].join(" ");
  return errors.map(({ script, line, column, message: detail }) => ({
    level: "error", text: `${script}.ts:${line}:${column} ${message(detail)}`, count: 1,
  }));
}

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
  t("▶ Running {target}…", { target: projectName ?? t("Lesson {number}", { number: lessonIndex + 1 }) });

/** Sandbox and Chapter 2 (Lesson 16 on) animate sprites and play sounds; Lessons 1–15 draw still frames and stay silent. */
export const v2Features = (start: { lesson: number } | { level: unknown }) => !("lesson" in start) || start.lesson >= 15;

/** Slow practice delays playback only; simulation time still advances by Time.deltaTime. */
export function scheduleRunFrame(frame: FrameRequestCallback, slow: boolean) {
  if (slow) setTimeout(() => requestAnimationFrame(frame), 100);
  else requestAnimationFrame(frame);
}
