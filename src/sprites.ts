// Pixel-art look of the game (Kenney's CC0 Pixel Platformer pack, plus our own Player critter drawn by scripts/draw-player.mjs): one sprite per tag, stretched exactly onto its box, so drawn shape = hitbox.
import Brick from "./sprites/Brick.png";
import Box from "./sprites/Box.png";
import Bullet from "./sprites/Bullet.png";
import Coin from "./sprites/Coin.png";
import CoinSpin from "./sprites/CoinSpin.png";
import Enemy from "./sprites/Enemy.png";
import EnemyWalk from "./sprites/EnemyWalk.png";
import Flag from "./sprites/Flag.png";
import FlagWave from "./sprites/FlagWave.png";
import GrassTop from "./sprites/GrassTop.png";
import Dirt from "./sprites/Dirt.png";
import PlayerIdle from "./sprites/PlayerIdle.png";
import PlayerJump from "./sprites/PlayerJump.png";
import PlayerWalk1 from "./sprites/PlayerWalk1.png";
import PlayerWalk2 from "./sprites/PlayerWalk2.png";
import Sky from "./sprites/Sky.png";
import Spikes from "./sprites/Spikes.png";
import Water from "./sprites/Water.png";
import WaterTop from "./sprites/WaterTop.png";
import { type Camera, type GameObject, toScreen } from "./engine";

const sprites = { Player: PlayerIdle, Enemy, Coin, Flag, Bullet, Box };
/** The Player critter's frames (16×16, drawn at 2× on its 32×32 box); Lessons draw idle only. */
export const playerFrames = { PlayerIdle, PlayerWalk1, PlayerWalk2, PlayerJump };
export const urls = { ...sprites, ...playerFrames, EnemyWalk, CoinSpin, FlagWave, GrassTop, Dirt, Brick, WaterTop, Water, Spikes, Sky };
type Tile = keyof typeof urls;

/** Animation frames per tag: only frames the art really has. A missing walk or jump falls back to idle. */
const animations: Record<keyof typeof sprites, { idle: Tile[]; walk?: Tile[]; jump?: Tile[] }> = {
  Player: { idle: ["PlayerIdle"], walk: ["PlayerWalk1", "PlayerWalk2"], jump: ["PlayerJump"] },
  Enemy: { idle: ["Enemy"], walk: ["Enemy", "EnemyWalk"] },
  Coin: { idle: ["Coin", "CoinSpin"] },
  Flag: { idle: ["Flag", "FlagWave"] },
  Bullet: { idle: ["Bullet"] },
  Box: { idle: ["Box"] },
};
const FPS = 8;

/** The frame a sprite tag draws: jump while moving up, walk while moving sideways, idle otherwise, cycling at 8 fps. undefined for a tag with no sprite. */
export function frameOf(tag: string, moved: { x: number; y: number }, time: number): Tile | undefined {
  if (!Object.hasOwn(animations, tag)) return undefined;
  const a = animations[tag as keyof typeof animations];
  const list = (moved.y > 0 && a.jump) || (moved.x !== 0 && a.walk) || a.idle;
  return list[Math.floor(time * FPS) % list.length];
}
/** Tags drawn as repeated tiles instead of one stretched sprite: the top row, then the fill below it. oneRow: a single row stretched to the box's height. */
const tiled: Record<string, { top: Tile; fill: Tile; oneRow?: boolean }> = {
  Ground: { top: "GrassTop", fill: "Dirt" },
  Platform: { top: "GrassTop", fill: "Dirt" },
  Wall: { top: "Brick", fill: "Brick" },
  Water: { top: "WaterTop", fill: "Water" },
  Spikes: { top: "Spikes", fill: "Spikes", oneRow: true },
};
const TILE = 20; // world pixels per tile: Level boxes are multiples of 20

type Rect = { x: number; y: number; w: number; h: number };

/** Splits a world box (bottom-left, y up) into tiles of size (rows rowH tall), rows hanging from the top edge so the top tile stays on top; edge tiles are cut short. */
export function tiles(box: Rect, size = TILE, rowH = size): Rect[] {
  const out: Rect[] = [];
  for (let top = box.y + box.h; top > box.y; top -= rowH)
    for (let x = box.x; x < box.x + box.w; x += size) {
      const h = Math.min(rowH, top - box.y);
      out.push({ x, y: top - h, w: Math.min(size, box.x + box.w - x), h });
    }
  return out;
}

/** Splits a box into 20 px tiles (rows rowH tall) paired with their image: the first row takes `top`, the rest `fill`. */
export function tileCells<T>(box: Rect, fill: T, top: T = fill, rowH = TILE): [Rect, T][] {
  return tiles(box, TILE, rowH).map((t) => [t, t.y + t.h === box.y + box.h ? top : fill]);
}

export type Images = Record<keyof typeof urls, ImageBitmap>;

// A Sandbox Project's own sprites (spec 050): one image per tag, plus an optional Top image for the first row when tiled.
/** How a tag with an own image draws. Pixel art: no smoothing. */
export type TagArt = { draw: "stretch" | "tile"; pixel: boolean };
/** An own sprite ready to draw. */
export type Own = TagArt & { image: ImageBitmap; top?: ImageBitmap };
const MAX_IMAGE = 256;

/** The key of a tag's image (`<tag>` or `<tag>:top`), the tag escaped so any name fits. */
export const imageName = (tag: string, top = false) => `${encodeURIComponent(tag)}${top ? ":top" : ""}`;

/** "" for a PNG or JPEG, else why the file is refused. */
export const imageFileError = (file: { type: string }) => (["image/png", "image/jpeg"].includes(file.type) ? "" : "Only PNG and JPEG images work here.");

/** The size an imported image is stored at: scaled down to fit 256×256, never up. */
export function fitSize(w: number, h: number, max = MAX_IMAGE) {
  const k = Math.min(1, max / w, max / h);
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

/** A picked or dropped file as the PNG Blob a Project stores; throws a plain message for a file that won't do. */
export async function importImage(file: Blob) {
  const error = imageFileError(file);
  if (error) throw new Error(error);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image can't be opened. Try saving it again as a PNG.");
  }
  const { w, h } = fitSize(bitmap.width, bitmap.height);
  const canvas = new OffscreenCanvas(w, h);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return canvas.convertToBlob({ type: "image/png" });
}

/** Decodes a Project's images for the tags that have settings: what drawWorld takes as `own`. */
export async function ownSprites(art: Record<string, TagArt> = {}, blobs: Record<string, Blob> = {}) {
  const own: Record<string, Own> = {};
  for (const [tag, a] of Object.entries(art)) {
    const image = blobs[imageName(tag)], top = blobs[imageName(tag, true)];
    if (image) own[tag] = { ...a, image: await createImageBitmap(image), top: top && (await createImageBitmap(top)) };
  }
  return own;
}

export async function loadImages(): Promise<Images> {
  const entries = Object.entries(urls).map(async ([k, url]) => [k, await createImageBitmap(await (await fetch(url)).blob())]);
  return Object.fromEntries(await Promise.all(entries));
}

/** Draws the sky, then every object: its tag's sprite, or a plain box in its color when the tag has none. With `time` (seconds) sprites animate from movement; without it they stay on their still frame. `own` sprites replace a tag's art and never animate. */
export function drawWorld(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, images: Images, camera: Camera, objects: GameObject[], time?: number, own: Record<string, Own> = {}) {
  const { width: W, height: H } = ctx.canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(images.Sky, 0, 0, W, H);
  for (const o of objects) {
    const box = { ...o.transform.position, w: o.w, h: o.h };
    const mine = Object.hasOwn(own, o.tag) ? own[o.tag] : undefined;
    ctx.imageSmoothingEnabled = !!mine && !mine.pixel;
    const tile = mine ? mine.draw === "tile" && { fill: mine.image, top: mine.top } : Object.hasOwn(tiled, o.tag) && { fill: images[tiled[o.tag].fill], top: images[tiled[o.tag].top] };
    if (tile) {
      const rowH = !mine && tiled[o.tag].oneRow ? box.h : TILE;
      for (const [t, img] of tileCells(box, tile.fill, tile.top, rowH)) {
        const r = toScreen(camera, t, W, H);
        ctx.drawImage(img, 0, 0, (img.width * t.w) / TILE, (img.height * t.h) / rowH, r.x, r.y, r.w, r.h);
      }
      continue;
    }
    const r = toScreen(camera, box, W, H);
    if (!mine && !Object.hasOwn(sprites, o.tag)) {
      ctx.fillStyle = o.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      continue;
    }
    const img = mine ? mine.image : images[time === undefined ? (o.tag as keyof typeof sprites) : frameOf(o.tag, o.moved, time)!];
    if (o.facing < 0) {
      ctx.save();
      ctx.translate(r.x * 2 + r.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, r.x, r.y, r.w, r.h);
      ctx.restore();
    } else ctx.drawImage(img, r.x, r.y, r.w, r.h);
  }
}
