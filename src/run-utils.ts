import { transform } from "sucrase";

// Sucrase keeps line N of the TS on line N of the JS, so stack lines are editor lines.
export function transpile(ts: string): string {
  return transform(ts, { transforms: ["typescript"] }).code;
}

export function errorLine(stack: string | undefined): { url: string; line: number; col: number } | undefined {
  const m = stack?.match(/(blob:[^\s)]*):(\d+):(\d+)/);
  return m ? { url: m[1], line: Number(m[2]), col: Number(m[3]) } : undefined;
}
