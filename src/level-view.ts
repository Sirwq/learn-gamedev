// The 🗺 Level tab (spec 049): the stopped game view is the editor, the left column its inspector.
import { type Box, Camera, GameObject, toScreen, Vector2 } from "./engine";
import { ART_TAGS, boxAt, type Handle, handleAt, handlePoints, GRID, levelCode, levelEditor, moved, resized } from "./level-editor";
import { drawWorld, type Images } from "./sprites";
import type { Project } from "./sandbox";
import { toast } from "./toast";

const W = 960, H = 540;
const CURSORS: Record<Handle, string> = { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize", ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize" };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/** `scripts` lists the Project's Script names; `save` keeps the Project after every change. */
export function levelView({ project, images, scripts, save }: { project: Project; images: Promise<Images>; scripts: () => string[]; save: () => void }) {
  const ed = levelEditor(project.level);
  const boxes = ed.level.boxes;
  const view = new Camera(project.level.camera); // the editor's own view: selecting from the list moves it
  const viewport = $("viewport");
  const fields = $<HTMLFieldSetElement>("level-fields");
  const tag = $<HTMLSelectElement>("level-tag");
  const script = $<HTMLSelectElement>("level-script");
  const nums = (["x", "y", "w", "h"] as const).map((k) => [k, $<HTMLInputElement>(`level-${k}`)] as const);
  const snapBtn = $<HTMLButtonElement>("level-snap");
  const undoBtn = $<HTMLButtonElement>("level-undo");
  const redoBtn = $<HTMLButtonElement>("level-redo");
  const list = $("level-objects");
  let open = false;
  let snap = true;
  let imgs: Images | undefined;
  images.then((i) => ((imgs = i), open && draw()));

  /** The game canvas, or a fresh one when a Run has handed it to its worker. */
  function canvas() {
    let c = $<HTMLCanvasElement>("game");
    try {
      return c.getContext("2d")!;
    } catch {
      const fresh = c.cloneNode() as HTMLCanvasElement;
      c.replaceWith(fresh);
      return fresh.getContext("2d")!;
    }
  }

  const screen = (b: Box) => toScreen(view, b, W, H);
  const scale = () => H / 2 / view.orthographicSize;

  /** The Level as it starts; while editing, also the grid, Script labels and the selection. */
  function draw() {
    if (!imgs) return;
    const ctx = canvas();
    drawWorld(ctx, imgs, view, boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y))));
    if (!open) return;
    const s = scale(), { x: cx, y: cy } = view.transform.position;
    if (snap) {
      ctx.strokeStyle = "#ffffff26";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const left = cx - W / 2 / s, bottom = cy - H / 2 / s;
      for (let x = Math.ceil(left / GRID) * GRID; x < left + W / s; x += GRID) {
        const sx = Math.round(W / 2 + (x - cx) * s) + 0.5;
        ctx.moveTo(sx, 0), ctx.lineTo(sx, H);
      }
      for (let y = Math.ceil(bottom / GRID) * GRID; y < bottom + H / s; y += GRID) {
        const sy = Math.round(H / 2 - (y - cy) * s) + 0.5;
        ctx.moveTo(0, sy), ctx.lineTo(W, sy);
      }
      ctx.stroke();
      // World origin: the two axes through (0, 0).
      const o = toScreen(view, { x: 0, y: 0, w: 0, h: 0 }, W, H);
      ctx.strokeStyle = "#ffffffaa";
      ctx.beginPath();
      ctx.moveTo(o.x + 0.5, 0), ctx.lineTo(o.x + 0.5, H), ctx.moveTo(0, o.y + 0.5), ctx.lineTo(W, o.y + 0.5);
      ctx.stroke();
    }
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.textBaseline = "top";
    for (const b of boxes) {
      if (!b.script) continue;
      const r = screen(b);
      label(ctx, b.script, r.x + 2, r.y + 2);
    }
    const b = boxes[ed.selected];
    if (!b) return;
    const r = screen(b);
    ctx.strokeStyle = "#4ce5fd";
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = "#ffffff";
    for (const [hx, hy] of Object.values(handlePoints(r))) (ctx.fillRect(hx - 4, hy - 4, 8, 8), ctx.strokeRect(hx - 4, hy - 4, 8, 8));
    label(ctx, `${b.tag}  ${b.x}, ${b.y}  ${b.w}×${b.h}`, r.x, r.y - 22 < 0 ? r.y + r.h + 8 : r.y - 22);
  }
  function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = "#000000b3";
    ctx.fillRect(x, y, w, 18);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x + 4, y + 3);
  }

  const option = (value: string, text = value) => Object.assign(document.createElement("option"), { value, textContent: text });
  const describe = (b: Box) => `${b.tag}${b.script ? ` · ${b.script}.ts` : ""} · ${b.x}, ${b.y}`;

  /** Inspector, object list and buttons from the editor's state. */
  function fill() {
    const b = boxes[ed.selected];
    fields.disabled = ed.running || !b;
    $("level-none").hidden = !!b;
    const tags = [...new Set([...ART_TAGS, ...boxes.map((x) => x.tag)])];
    tag.replaceChildren(...tags.map((t) => option(t)));
    script.replaceChildren(option("", "(none)"), ...scripts().map((s) => option(s, `${s}.ts`)));
    tag.value = b?.tag ?? "";
    script.value = b?.script ?? "";
    for (const [k, input] of nums) input.value = b ? String(b[k]) : "";
    undoBtn.disabled = !ed.canUndo();
    redoBtn.disabled = !ed.canRedo();
    list.replaceChildren(...boxes.map((x, i) => {
      const li = document.createElement("li");
      const btn = Object.assign(document.createElement("button"), { textContent: describe(x) });
      if (i === ed.selected) btn.ariaCurrent = "true";
      btn.onclick = () => (select(i, true), list.querySelectorAll("button")[i].focus()); // the list was rebuilt: keep the student's place
      li.append(btn);
      return li;
    }));
  }
  const refresh = () => (fill(), draw());
  /** After every committed change, undo or redo. */
  function changed() {
    save();
    refresh();
  }

  function select(i: number, reveal = false) {
    ed.selected = i;
    const b = boxes[i];
    if (b && reveal) {
      const r = screen(b);
      if (r.x < 0 || r.y < 0 || r.x + r.w > W || r.y + r.h > H) view.transform.position = new Vector2(b.x + b.w / 2, b.y + b.h / 2);
    }
    refresh();
  }

  tag.onchange = () => ed.edit((bs) => (bs[ed.selected].tag = tag.value)) && changed();
  script.onchange = () => ed.edit((bs) => {
    const b = bs[ed.selected];
    if (script.value) b.script = script.value;
    else delete b.script;
  }) && changed();
  for (const [k, input] of nums) {
    input.onchange = () => {
      const v = Math.round(Number(input.value));
      // Width and height stay positive, as a drawn box needs.
      if (!input.value || !Number.isFinite(v) || ((k === "w" || k === "h") && v < 1)) return refresh();
      if (ed.edit((bs) => (bs[ed.selected][k] = v))) changed();
    };
  }
  $("level-duplicate").onclick = () => {
    const b = boxes[ed.selected];
    if (ed.edit((bs) => bs.push({ ...b, x: b.x + GRID, y: b.y + GRID }))) (ed.selected = boxes.length - 1), changed();
  };
  $("level-delete").onclick = () => {
    if (ed.edit((bs) => bs.splice(ed.selected, 1))) (ed.selected = -1), changed();
    $("level-objects").querySelector("button")?.focus(); // the Delete button is now disabled: keep focus in the inspector
  };
  const undo = () => ed.undo() && changed();
  const redo = () => ed.redo() && changed();
  undoBtn.onclick = undo;
  redoBtn.onclick = redo;
  snapBtn.onclick = () => {
    snap = !snap;
    snapBtn.ariaPressed = String(snap);
    draw();
  };

  // View Level as Code: read-only, with Copy for pasting into a lesson.ts.
  const codeBox = $<HTMLDialogElement>("level-code-box");
  $("level-code").onclick = () => {
    codeBox.querySelector("code")!.textContent = levelCode(boxes);
    codeBox.showModal();
  };
  $("level-code-close").onclick = () => codeBox.close();
  $("level-copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(levelCode(boxes));
      toast("Level code copied");
    } catch {
      getSelection()?.selectAllChildren(codeBox.querySelector("code")!);
      toast("Copying didn't work: the code is selected, press Ctrl/Cmd+C.");
    }
  };

  // Mouse: click selects, drag moves, the 8 handles resize. Alt places freely.
  const at = (e: PointerEvent) => {
    const r = $("game").getBoundingClientRect();
    return { sx: ((e.clientX - r.left) * W) / r.width, sy: ((e.clientY - r.top) * H) / r.height };
  };
  let drag: { start: Box; sx: number; sy: number; handle?: Handle } | undefined;
  viewport.addEventListener("pointerdown", (e) => {
    if (!open || ed.running || (e.target as HTMLElement).id !== "game" || e.button !== 0) return;
    const { sx, sy } = at(e);
    const sel = boxes[ed.selected];
    const handle = sel && handleAt(screen(sel), sx, sy);
    if (!handle) {
      const s = scale(), { x: cx, y: cy } = view.transform.position;
      select(boxAt(boxes, cx + (sx - W / 2) / s, cy - (sy - H / 2) / s));
    }
    if (ed.selected < 0 || !ed.begin()) return;
    drag = { start: { ...boxes[ed.selected] }, sx, sy, handle };
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!open || ed.running || (!drag && (e.target as HTMLElement).id !== "game")) return;
    const { sx, sy } = at(e);
    if (!drag) {
      const sel = boxes[ed.selected];
      const handle = sel && handleAt(screen(sel), sx, sy);
      $("game").style.cursor = handle ? CURSORS[handle] : "";
      return;
    }
    const s = scale(), dx = (sx - drag.sx) / s, dy = -(sy - drag.sy) / s;
    boxes[ed.selected] = drag.handle ? resized(drag.start, drag.handle, dx, dy, snap && !e.altKey) : moved(drag.start, dx, dy, snap && !e.altKey);
    draw();
  });
  const drop = () => {
    if (!drag) return;
    drag = undefined;
    if (ed.commit()) changed();
  };
  viewport.addEventListener("pointerup", drop);
  viewport.addEventListener("pointercancel", drop);

  document.addEventListener("keydown", (e) => {
    if (!open || !(e.ctrlKey || e.metaKey)) return;
    if ((e.target as HTMLElement).closest("input, textarea, .monaco-editor")) return; // their own undo
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) (e.preventDefault(), undo());
    else if (k === "y" || (k === "z" && e.shiftKey)) (e.preventDefault(), redo());
  });

  return {
    /** Shows or hides the editor; the stage moves into the code column and the inspector takes the Lesson panel's place. */
    setOpen(on: boolean) {
      if (on === open) return;
      open = on;
      $("lesson").hidden = on;
      $("inspector").hidden = !on;
      if (on) $("tabbar").after($("stage"));
      else $("left").append($("stage"));
      $("game").style.cursor = "";
      if (!ed.running) refresh();
      else fill();
    },
    /** A Run locks the editor; at Stop the Level shows again as the editor has it. */
    setRunning(on: boolean) {
      ed.running = on;
      drop();
      $("level-locked").hidden = !on;
      if (open) on ? fill() : refresh();
    },
  };
}
