// The 🗺 Level tab (spec 049): the stopped game view is the editor, the left column its inspector.
import { type Box, Camera, type CameraStart, GameObject, toScreen, Vector2 } from "./engine";
import { ART_TAGS, bounds, boxAt, cameraStart, dropped, fitView, type Handle, handleAt, handlePoints, GRID, levelCode, levelEditor, matchShape, moved, nudged, paletteTags, putImage, resized, sameImages, zoomed, zoomOf } from "./level-editor";
import { drawWorld, imageName, importImage, type Images, type Own, ownSprites } from "./sprites";
import type { Project } from "./sandbox";
import { canStoreImages } from "./project-storage";
import { toast } from "./toast";
import { t as tr } from "./i18n";

const W = 960, H = 540;
const CURSORS: Record<Handle, string> = { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize", ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize" };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const NEW = "\u0000new"; // the "+ New tag…" / "+ New Script…" option: no tag or Script can be named this
const MW = 960, MH = 80; // the minimap canvas

/** `scripts` lists the Project's Script names; `save` keeps the Project after every change; `addScript` makes a new Script file and tab, returning what is wrong with the name or "". */
export function levelView({ project, images, ownImages, scripts, save, addScript }: { project: Project; images: Promise<Images>; ownImages: Record<string, Blob>; scripts: () => string[]; save: (images: Record<string, Blob>) => void; addScript: (name: string) => string }) {
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
  images.then((i) => ((imgs = i), (paletteKey = ""), open && refresh()));

  // Own sprites (spec 050): Blobs in the editor's state (so undo covers them), decoded into `own` for drawing.
  let own: Record<string, Own> = {};
  Object.assign(ed.images, ownImages);
  let shownArt = "";
  let shownImages: Record<string, Blob> = {};
  let decoding = 0;
  /** After a change to the tags' art or images: decodes them for drawing. */
  async function syncArt() {
    const art = JSON.stringify(project.level.art ?? {});
    if (art === shownArt && sameImages(shownImages, ed.images)) return;
    shownArt = art;
    shownImages = { ...ed.images };
    const mine = ++decoding;
    const decoded = await ownSprites(project.level.art, ed.images).catch(() => ({}));
    if (mine !== decoding) return; // a newer change is decoding
    own = decoded;
    paletteKey = "";
    if (!ed.running) open ? refresh() : draw();
  }
  syncArt();

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
  /** The world point under a game-canvas point. */
  const world = (sx: number, sy: number) => {
    const s = scale(), { x, y } = view.transform.position;
    return { x: x + (sx - W / 2) / s, y: y - (sy - H / 2) / s };
  };
  const viewNow = (): CameraStart => ({ ...view.transform.position, size: view.orthographicSize });
  function setView({ x, y, size }: CameraStart) {
    view.transform.position = new Vector2(x, y);
    view.orthographicSize = size;
    draw();
  }
  const pan = (dx: number, dy: number) => setView({ ...viewNow(), x: view.transform.position.x + dx, y: view.transform.position.y + dy });

  /** The Level as it starts; while editing, also the grid, Script labels and the selection. */
  function draw() {
    if (!imgs) return;
    const ctx = canvas();
    drawWorld(ctx, imgs, view, boxes.map((b) => new GameObject(b.tag, b.w, b.h, b.color, undefined, new Vector2(b.x, b.y))), undefined, own);
    if (!open) return;
    drawMinimap();
    $("level-zoom-value").textContent = `${Math.round(zoomOf(view.orthographicSize) * 100)}%`;
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
  /** The whole Level (with a margin) squeezed into the strip, and the view's rect on it. */
  const mapArea = () => {
    const b = bounds(boxes) ?? { x: 0, y: 0, w: W, h: H };
    const pad = 200, w = b.w + 2 * pad, h = b.h + 2 * pad;
    const k = Math.min(MW / w, MH / h);
    return { k, x0: b.x - pad - (MW / k - w) / 2, y0: b.y - pad - (MH / k - h) / 2 };
  };
  function drawMinimap() {
    const ctx = $<HTMLCanvasElement>("level-minimap").getContext("2d")!;
    const { k, x0, y0 } = mapArea();
    const rect = (r: { x: number; y: number; w: number; h: number }) => [(r.x - x0) * k, MH - (r.y + r.h - y0) * k, r.w * k, r.h * k] as const;
    ctx.fillStyle = "#5c94fc";
    ctx.fillRect(0, 0, MW, MH);
    for (const b of boxes) if (b.w > 0 && b.h > 0) (ctx.fillStyle = b.color), ctx.fillRect(...rect(b));
    const s = scale(), { x, y } = view.transform.position;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(...rect({ x: x - W / 2 / s, y: y - H / 2 / s, w: W / s, h: H / s }));
  }
  const minimap = $<HTMLCanvasElement>("level-minimap");
  let mapping = false;
  const jump = (e: PointerEvent) => {
    const r = minimap.getBoundingClientRect(), { k, x0, y0 } = mapArea();
    setView({ ...viewNow(), x: x0 + ((e.clientX - r.left) * MW) / r.width / k, y: y0 + (MH - ((e.clientY - r.top) * MH) / r.height) / k });
  };
  minimap.addEventListener("pointerdown", (e) => ((mapping = true), minimap.setPointerCapture(e.pointerId), jump(e)));
  minimap.addEventListener("pointermove", (e) => mapping && jump(e));
  minimap.addEventListener("pointerup", () => (mapping = false));
  minimap.addEventListener("pointercancel", () => (mapping = false));

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
    tag.replaceChildren(...tags.map((t) => option(t)), option(NEW, "+ New tag…"));
    script.replaceChildren(option("", tr("(none)")), ...scripts().map((s) => option(s, `${s}.ts`)), option(NEW, tr("+ New Script…")));
    tag.value = b?.tag ?? "";
    script.value = b?.script ?? "";
    for (const [k, input] of nums) input.value = b ? String(b[k]) : "";
    fillArt(b);
    fillPalette();
    for (const b of palette.querySelectorAll("button")) b.disabled = ed.running;
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
    save(ed.images);
    refresh();
    syncArt();
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

  // The palette: one button per tag with its sprite; press it (or Enter) to drop one in the middle of the view, or drag it in.
  const palette = $("level-palette");
  let paletteKey = "";
  function fillPalette() {
    const tags = paletteTags(boxes);
    const key = tags.map((t) => t.tag + t.color).join();
    if (key === paletteKey || !imgs) return;
    paletteKey = key;
    palette.replaceChildren(...tags.map((t) => {
      const btn = Object.assign(document.createElement("button"), { title: tr("Add a {tag}: press, or drag it into the view", { tag: t.tag }) });
      const icon = Object.assign(document.createElement("canvas"), { width: 24, height: 24 });
      icon.ariaHidden = "true";
      drawIcon(icon, t.tag, t.color);
      btn.append(icon, t.tag);
      btn.onclick = () => add(t.tag, view.transform.position);
      btn.onpointerdown = (e) => e.button === 0 && (carry = { tag: t.tag, x: e.clientX, y: e.clientY, moved: false });
      return btn;
    }));
  }
  /** One 20×20 world-px box of the tag on a small canvas, as the game draws it. */
  function drawIcon(c: HTMLCanvasElement, tag: string, color: string) {
    if (imgs) drawWorld(c.getContext("2d")!, imgs, new Camera({ x: 10, y: 10, size: 10 }), [new GameObject(tag, 20, 20, color, undefined, new Vector2(0, 0))], undefined, own);
  }

  // The selected box's tag's image: Change / drop a file, Reset or Remove, Draw, Match image shape; Pixel art and the Top image under More.
  const artThumb = $<HTMLCanvasElement>("level-art-thumb");
  const artReset = $<HTMLButtonElement>("level-art-reset");
  const artDraw = $<HTMLSelectElement>("level-art-draw");
  const artMatch = $<HTMLButtonElement>("level-art-match");
  const artMore = $<HTMLButtonElement>("level-art-more");
  const artPixel = $<HTMLInputElement>("level-art-pixel");
  const artFile = $<HTMLInputElement>("level-art-file");
  const topThumb = $<HTMLCanvasElement>("level-art-top-thumb");
  function fillArt(b: Box | undefined) {
    const t = b?.tag ?? "";
    const art = project.level.art?.[t];
    const has = !!art && !!ed.images[imageName(t)];
    artReset.hidden = !has;
    artReset.textContent = ART_TAGS.includes(t) ? tr("Reset to default") : tr("Remove image");
    $("level-art-own").hidden = !has;
    $("level-art-extra").hidden = !has || artMore.ariaExpanded !== "true";
    $("level-art-top-remove").hidden = !ed.images[imageName(t, true)];
    if (art) (artDraw.value = art.draw), (artPixel.checked = art.pixel);
    artMatch.disabled = !own[t];
    if (b) drawIcon(artThumb, t, b.color);
    const top = topThumb.getContext("2d")!;
    top.clearRect(0, 0, 24, 24);
    if (own[t]?.top) top.drawImage(own[t].top!, 0, 0, 24, 24);
  }
  /** The picked or dropped file as a stored PNG, or undefined after a toast saying why not. */
  async function readImage(file: File) {
    if (!canStoreImages()) return void toast(tr("Images can't be saved in this browser right now. Reload the page and try again."));
    try {
      return await importImage(file);
    } catch (e) {
      toast((e as Error).message);
    }
  }
  async function useImage(file: File, top: boolean) {
    const b = boxes[ed.selected];
    if (!b) return;
    const tagName = b.tag; // the selection may change while the image loads
    const blob = await readImage(file);
    if (blob && ed.setImage(tagName, blob, top)) changed();
  }
  let pickTop = false;
  const pick = (top: boolean) => ((pickTop = top), artFile.click());
  artFile.onchange = () => {
    const f = artFile.files?.[0];
    artFile.value = "";
    if (f) useImage(f, pickTop);
  };
  $("level-art-change").onclick = () => pick(false);
  $("level-art-top").onclick = () => pick(true);
  artThumb.ondragover = (e) => {
    if (fields.disabled) return;
    e.preventDefault();
    artThumb.classList.add("dropping");
  };
  artThumb.ondragleave = () => artThumb.classList.remove("dropping");
  artThumb.ondrop = (e) => {
    e.preventDefault();
    artThumb.classList.remove("dropping");
    const f = e.dataTransfer?.files[0];
    if (f && !fields.disabled) useImage(f, false);
  };
  const selectedTag = () => boxes[ed.selected]?.tag ?? "";
  artReset.onclick = () => ed.setImage(selectedTag(), undefined) && changed();
  $("level-art-top-remove").onclick = () => ed.setImage(selectedTag(), undefined, true) && changed();
  artDraw.onchange = () => ed.setArt(selectedTag(), { draw: artDraw.value as "stretch" | "tile" }) && changed();
  artPixel.onchange = () => ed.setArt(selectedTag(), { pixel: artPixel.checked }) && changed();
  artMatch.onclick = () => {
    const img = own[selectedTag()]?.image;
    if (img && ed.edit((bs) => (bs[ed.selected] = matchShape(bs[ed.selected], img.width, img.height)))) changed();
  };
  artMore.onclick = () => {
    artMore.ariaExpanded = String(artMore.ariaExpanded !== "true");
    fill();
  };

  function add(t: string, at: { x: number; y: number }) {
    if (ed.edit((bs) => bs.push(dropped(t, at, scripts(), paletteTags(boxes))))) (ed.selected = boxes.length - 1), changed();
  }
  let carry: { tag: string; x: number; y: number; moved: boolean } | undefined;
  document.addEventListener("pointermove", (e) => {
    if (!carry || carry.moved || Math.hypot(e.clientX - carry.x, e.clientY - carry.y) < 4) return;
    carry.moved = true;
    document.body.classList.add("carrying");
  });
  const putDown = (e: PointerEvent) => {
    const c = carry;
    carry = undefined;
    document.body.classList.remove("carrying");
    if (!c?.moved || e.type !== "pointerup") return;
    const r = $("game").getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    add(c.tag, world(((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height));
  };
  document.addEventListener("pointerup", putDown);
  document.addEventListener("pointercancel", putDown);

  // "+ New tag…": a name, and an image or a colour; the selected box takes it, in one undo step.
  const tagBox = $<HTMLDialogElement>("level-tag-box");
  const tagImage = $<HTMLInputElement>("level-tag-image");
  tagBox.onclose = async () => {
    const name = $<HTMLInputElement>("level-tag-name").value.trim();
    const color = $<HTMLInputElement>("level-tag-color").value;
    const file = tagImage.files?.[0];
    tagImage.value = "";
    if (tagBox.returnValue !== "ok" || !name) return refresh();
    const blob = file && (await readImage(file));
    if (file && !blob) return refresh();
    if (!ed.edit((bs) => (Object.assign(bs[ed.selected], { tag: name, color }), blob && putImage(ed.level, ed.images, name, blob)))) return refresh();
    changed();
  };
  tag.onchange = () => {
    if (tag.value !== NEW) return void (ed.edit((bs) => (bs[ed.selected].tag = tag.value)) && changed());
    $<HTMLInputElement>("level-tag-name").value = "";
    tagBox.returnValue = "";
    tagBox.showModal();
  };
  script.onchange = () => {
    let name = script.value;
    if (name === NEW) {
      name = prompt(tr("Name of the new Script (its class name, like Coin):"))?.trim() ?? "";
      const error = name && addScript(name);
      if (error) toast(error);
      if (!name || error) return refresh();
    }
    if (ed.edit((bs) => {
      const b = bs[ed.selected];
      if (name) b.script = name;
      else delete b.script;
    })) changed();
    else refresh();
  };
  let proportionalKey = false;
  document.addEventListener("keydown", (e) => (proportionalKey = e.ctrlKey || e.metaKey));
  document.addEventListener("keyup", (e) => (proportionalKey = e.ctrlKey || e.metaKey));
  window.addEventListener("blur", () => (proportionalKey = false));
  for (const [k, input] of nums) {
    input.onchange = () => {
      const v = Math.round(Number(input.value));
      // Width and height stay positive, as a drawn box needs.
      if (!input.value || !Number.isFinite(v) || ((k === "w" || k === "h") && v < 1)) return refresh();
      if (ed.edit((bs) => {
        const b = bs[ed.selected];
        if (proportionalKey && (k === "w" || k === "h") && b.w > 0 && b.h > 0) {
          if (k === "w") b.h = Math.max(1, Math.round((v * b.h) / b.w));
          else b.w = Math.max(1, Math.round((v * b.w) / b.h));
        }
        b[k] = v;
      })) changed();
    };
  }
  const duplicate = () => {
    const b = boxes[ed.selected];
    if (b && ed.edit((bs) => bs.push({ ...b, x: b.x + GRID, y: b.y + GRID }))) (ed.selected = boxes.length - 1), changed();
  };
  const remove = () => ed.selected >= 0 && ed.edit((bs) => bs.splice(ed.selected, 1)) && ((ed.selected = -1), changed());
  $("level-duplicate").onclick = duplicate;
  $("level-delete").onclick = () => {
    remove();
    $("level-objects").querySelector("button")?.focus(); // the Delete button is now disabled: keep focus in the inspector
  };

  // Moving around: − / + zoom on the middle of the view, Fit Level, and the camera start.
  const zoomBy = (f: number, at: { x: number; y: number } = view.transform.position) => setView(zoomed(viewNow(), f, at));
  $("level-zoom-in").onclick = () => zoomBy(1.25);
  $("level-zoom-out").onclick = () => zoomBy(1 / 1.25);
  $("level-fit").onclick = () => setView(fitView(boxes));
  $("level-camera").onclick = () => {
    project.level.camera = cameraStart(viewNow());
    save(ed.images);
    toast(tr("Camera start saved: Run starts the camera here"));
  };
  viewport.addEventListener("wheel", (e) => {
    if (!open || (e.target as HTMLElement).id !== "game") return;
    e.preventDefault();
    const r = $("game").getBoundingClientRect(), s = scale();
    if (e.ctrlKey || e.metaKey) zoomBy(Math.exp(-e.deltaY * 0.002), world(((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height));
    else if (e.shiftKey && !e.deltaX) pan(e.deltaY / s, 0);
    else pan(e.deltaX / s, -e.deltaY / s);
  }, { passive: false });
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
      toast(tr("Level code copied"));
    } catch {
      getSelection()?.selectAllChildren(codeBox.querySelector("code")!);
      toast(tr("Copying didn't work: the code is selected, press Ctrl/Cmd+C."));
    }
  };

  // Mouse: click selects, drag moves, the 8 handles resize. Alt places freely.
  const at = (e: PointerEvent) => {
    const r = $("game").getBoundingClientRect();
    return { sx: ((e.clientX - r.left) * W) / r.width, sy: ((e.clientY - r.top) * H) / r.height };
  };
  let drag: { start: Box; sx: number; sy: number; handle?: Handle } | undefined;
  let panning: { sx: number; sy: number; x: number; y: number } | undefined; // dragging empty sky
  viewport.addEventListener("pointerdown", (e) => {
    if (!open || ed.running || (e.target as HTMLElement).id !== "game" || e.button !== 0) return;
    const { sx, sy } = at(e);
    const sel = boxes[ed.selected];
    const handle = sel && handleAt(screen(sel), sx, sy);
    if (!handle) {
      const p = world(sx, sy);
      select(boxAt(boxes, p.x, p.y));
    }
    viewport.setPointerCapture(e.pointerId);
    if (ed.selected < 0) return void (panning = { sx, sy, ...view.transform.position });
    if (!ed.begin()) return;
    drag = { start: { ...boxes[ed.selected] }, sx, sy, handle };
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!open || ed.running || (!drag && !panning && (e.target as HTMLElement).id !== "game")) return;
    const { sx, sy } = at(e);
    if (panning) return setView({ ...viewNow(), x: panning.x - (sx - panning.sx) / scale(), y: panning.y + (sy - panning.sy) / scale() });
    if (!drag) {
      const sel = boxes[ed.selected];
      const handle = sel && handleAt(screen(sel), sx, sy);
      $("game").style.cursor = handle ? CURSORS[handle] : "";
      return;
    }
    const s = scale(), dx = (sx - drag.sx) / s, dy = -(sy - drag.sy) / s;
    boxes[ed.selected] = drag.handle ? resized(drag.start, drag.handle, dx, dy, snap && !e.altKey, e.ctrlKey || e.metaKey) : moved(drag.start, dx, dy, snap && !e.altKey);
    draw();
  });
  const drop = () => {
    panning = undefined;
    if (!drag) return;
    drag = undefined;
    if (ed.commit()) changed();
  };
  viewport.addEventListener("pointerup", drop);
  viewport.addEventListener("pointercancel", drop);

  // Arrows move the selection (Alt: by 1), Shift+arrows resize it; with nothing selected they pan. Del, Ctrl+D, Esc.
  document.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (!open || ed.running || (t !== document.body && !t.closest("#level-area, #inspector")) || t.closest("input, select, textarea, dialog")) return;
    const b = boxes[ed.selected];
    const next = b && nudged(b, e.key, e.shiftKey, e.altKey, snap, e.ctrlKey || e.metaKey);
    if (next) ed.edit((bs) => (bs[ed.selected] = next)) && changed();
    else if (!b && e.key.startsWith("Arrow")) {
      const d = 100 / scale(); // 100 screen pixels
      pan(e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0, e.key === "ArrowUp" ? d : e.key === "ArrowDown" ? -d : 0);
    } else if (e.key === "Delete") remove();
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") duplicate();
    else if (e.key === "Escape" && b) select(-1);
    else return;
    e.preventDefault();
  });
  document.addEventListener("keydown", (e) => {
    if (!open || !(e.ctrlKey || e.metaKey)) return;
    if ((e.target as HTMLElement).closest("input, textarea, .monaco-editor")) return; // their own undo
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) (e.preventDefault(), undo());
    else if (k === "y" || (k === "z" && e.shiftKey)) (e.preventDefault(), redo());
  });

  return {
    /** The Project's own images as they are now, for a Run. */
    images: () => ({ ...ed.images }),
    /** Shows or hides the editor; the stage moves into the code column and the inspector takes the Lesson panel's place. */
    setOpen(on: boolean) {
      if (on === open) return;
      open = on;
      $("left-views").hidden = on;
      $("lesson").hidden = on || $("left").dataset.view === "objects";
      $("objects").hidden = on || $("left").dataset.view !== "objects";
      $("inspector").hidden = !on;
      $("level-area").hidden = !on;
      if (on) $("level-minimap").before($("stage"));
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
