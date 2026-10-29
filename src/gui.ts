// Draws the worker's GUI.Label text over the game view, and keeps the hidden list screen readers read.
import type { Label } from "./engine";

// Kenney Pixel metrics in em: ascent 640 and line 768 of 1024 units.
const ASCENT = 0.625;
const LINE = 0.75;

/** Top-left of every line of a label, aligned inside its Rect by its TextAnchor; `measure` gives a line's width. */
export function layout({ x, y, w, h, text, size, anchor }: Label, measure: (line: string) => number) {
  const lines = text.split("\n");
  const block = lines.length * size * LINE;
  const top = anchor.startsWith("Upper") ? y : anchor.startsWith("Middle") ? y + (h - block) / 2 : y + h - block;
  return lines.map((line, i) => {
    const width = measure(line);
    const left = anchor.endsWith("Left") ? x : anchor.endsWith("Center") ? x + (w - width) / 2 : x + w - width;
    return { line, x: Math.round(left), y: Math.round(top + i * size * LINE) };
  });
}

const AROUND = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

/** Clears the overlay canvas and draws this frame's labels in order, later ones on top. */
export function drawLabels(ctx: CanvasRenderingContext2D, labels: Label[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.textBaseline = "alphabetic";
  for (const label of labels) {
    ctx.font = `${label.size}px "Kenney Pixel"`;
    for (const { line, x, y } of layout(label, (s) => ctx.measureText(s).width)) {
      const base = y + label.size * ASCENT;
      if (label.outline) {
        ctx.fillStyle = "#000";
        for (const [dx, dy] of AROUND) ctx.fillText(line, x + dx, base + dy);
      }
      ctx.fillStyle = label.color;
      ctx.fillText(line, x, base);
    }
  }
}

/** Returns a function that passes the labels' texts to `show`, only when they differ from the last ones shown. */
export function textList(show: (texts: string[]) => void) {
  let last = "[]";
  return (labels: readonly Pick<Label, "text">[]) => {
    const texts = labels.map((l) => l.text);
    const key = JSON.stringify(texts);
    if (key !== last) show(texts);
    last = key;
  };
}

/** Loads the bundled pixel font; until it has loaded, labels draw in the fallback font. */
export const loadFont = () => {
  const font = new FontFace("Kenney Pixel", `url(${import.meta.env.BASE_URL}fonts/KenneyPixel.ttf)`);
  document.fonts.add(font);
  return font.load();
};
