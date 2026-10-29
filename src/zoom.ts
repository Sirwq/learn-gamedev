// Editor font size, shared by the code editor, the Compare diff and the Docs tab.

export const FONT_MIN = 12;
export const FONT_MAX = 28;
export const FONT_DEFAULT = 14;

/** step 1 = bigger, -1 = smaller, 0 = back to the default. */
export const zoom = (size: number, step: number) =>
  step ? Math.min(FONT_MAX, Math.max(FONT_MIN, size + step * 2)) : FONT_DEFAULT;

export const zoomPercent = (size: number) => `${Math.round((size / FONT_DEFAULT) * 100)}%`;

/** The size saved in localStorage, or the default if it's missing or not a sane size. */
export function savedFontSize(raw: string | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= FONT_MIN && n <= FONT_MAX ? n : FONT_DEFAULT;
}
