// Console panel lines, kept apart from the DOM so the rules can be tested headless.

export type LogLevel = "log" | "warn" | "error";
export type ConsoleLine = { level: LogLevel; text: string; count: number };

export const MAX_LINES = 500;

/** Adds a line: an identical line right after collapses into a count, and only the last 500 are kept. */
export function addLine(lines: ConsoleLine[], level: LogLevel, text: string, count = 1): void {
  const last = lines.at(-1);
  if (last && last.level === level && last.text === text) last.count += count;
  else lines.push({ level, text, count });
  if (lines.length > MAX_LINES) lines.splice(0, lines.length - MAX_LINES);
}

/** Each Run starts with an empty Console. */
export const clearLines = (lines: ConsoleLine[]) => void lines.splice(0);

export const lineText = ({ text, count }: ConsoleLine) => (count > 1 ? `${text} ×${count}` : text);
