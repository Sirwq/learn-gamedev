import { transform } from "sucrase";

// Sucrase keeps line N of the TS on line N of the JS, so stack lines are editor lines.
export function transpile(ts: string): string {
  return transform(ts, { transforms: ["typescript"] }).code;
}

export function errorLine(stack: string | undefined): { line: number; col: number } | undefined {
  const m = stack?.match(/blob:[^\s)]*:(\d+):(\d+)/);
  return m ? { line: Number(m[1]), col: Number(m[2]) } : undefined;
}
