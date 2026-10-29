// Pixel-art look of the game (Kenney's CC0 Pixel Platformer pack): one sprite per tag, stretched exactly onto its box, so drawn shape = hitbox.
import Brick from "./sprites/Brick.png";
import Bullet from "./sprites/Bullet.png";
import Coin from "./sprites/Coin.png";
import Enemy from "./sprites/Enemy.png";
import Flag from "./sprites/Flag.png";
import GrassTop from "./sprites/GrassTop.png";
import Dirt from "./sprites/Dirt.png";
import Player from "./sprites/Player.png";
import Sky from "./sprites/Sky.png";
import Spikes from "./sprites/Spikes.png";
import Water from "./sprites/Water.png";
import WaterTop from "./sprites/WaterTop.png";
import { type Camera, type GameObject, toScreen } from "./engine";

const sprites = { Player, Enemy, Coin, Flag, Bullet };
const urls = { ...sprites, GrassTop, Dirt, Brick, WaterTop, Water, Spikes, Sky };
type Tile = keyof typeof urls;
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

export type Images = Record<keyof typeof urls, ImageBitmap>;

export async function loadImages(): Promise<Images> {
  const entries = Object.entries(urls).map(async ([k, url]) => [k, await createImageBitmap(await (await fetch(url)).blob())]);
  return Object.fromEntries(await Promise.all(entries));
}

/** Draws the sky, then every object: its tag's sprite, or a plain box in its color when the tag has none. */
export function drawWorld(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, images: Images, camera: Camera, objects: GameObject[]) {
  const { width: W, height: H } = ctx.canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(images.Sky, 0, 0, W, H);
  for (const o of objects) {
    const box = { ...o.transform.position, w: o.w, h: o.h };
    const tile = Object.hasOwn(tiled, o.tag) && tiled[o.tag];
    if (tile) {
      const top = box.y + box.h;
      const rowH = tile.oneRow ? box.h : TILE;
      for (const t of tiles(box, TILE, rowH)) {
        const img = images[t.y + t.h === top ? tile.top : tile.fill];
        const r = toScreen(camera, t, W, H);
        ctx.drawImage(img, 0, 0, (img.width * t.w) / TILE, (img.height * t.h) / rowH, r.x, r.y, r.w, r.h);
      }
      continue;
    }
    const r = toScreen(camera, box, W, H);
    if (!Object.hasOwn(sprites, o.tag)) {
      ctx.fillStyle = o.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      continue;
    }
    const img = images[o.tag as keyof typeof sprites];
    if (o.facing < 0) {
      ctx.save();
      ctx.translate(r.x * 2 + r.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, r.x, r.y, r.w, r.h);
      ctx.restore();
    } else ctx.drawImage(img, r.x, r.y, r.w, r.h);
  }
}
