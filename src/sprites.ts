// Pixel-art look of the game: one sprite per tag, stretched exactly onto its box, so drawn shape = hitbox.
import Brick from "./sprites/Brick.png";
import Bullet from "./sprites/Bullet.png";
import Coin from "./sprites/Coin.png";
import Enemy from "./sprites/Enemy.png";
import Flag from "./sprites/Flag.png";
import Grass from "./sprites/Grass.png";
import Player from "./sprites/Player.png";
import Sky from "./sprites/Sky.png";
import { type Camera, type GameObject, toScreen } from "./engine";

const sprites = { Player, Enemy, Coin, Flag, Bullet };
const urls = { ...sprites, Grass, Brick, Sky };
/** Tags drawn as a repeated 8×8 tile instead of one stretched sprite. */
const tiled: Record<string, keyof typeof urls> = { Ground: "Grass", Platform: "Grass", Wall: "Brick" };
const TILE = 24; // world pixels per tile: 3 per sprite pixel

type Rect = { x: number; y: number; w: number; h: number };

/** Splits a world box (bottom-left, y up) into tiles of size, rows hanging from the top edge so grass stays on top; edge tiles are cut short. */
export function tiles(box: Rect, size = TILE): Rect[] {
  const out: Rect[] = [];
  for (let top = box.y + box.h; top > box.y; top -= size)
    for (let x = box.x; x < box.x + box.w; x += size) {
      const h = Math.min(size, top - box.y);
      out.push({ x, y: top - h, w: Math.min(size, box.x + box.w - x), h });
    }
  return out;
}

export type Images = Record<keyof typeof urls, ImageBitmap>;

export async function loadImages(): Promise<Images> {
  const entries = Object.entries(urls).map(async ([k, url]) => [k, await createImageBitmap(await (await fetch(url)).blob())]);
  return Object.fromEntries(await Promise.all(entries));
}

/** Draws the night sky, then every object: its tag's sprite, or a plain box in its color when the tag has none. */
export function drawWorld(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, images: Images, camera: Camera, objects: GameObject[]) {
  const { width: W, height: H } = ctx.canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(images.Sky, 0, 0, W, H);
  for (const o of objects) {
    const box = { ...o.transform.position, w: o.w, h: o.h };
    const tile = Object.hasOwn(tiled, o.tag) && tiled[o.tag];
    if (tile) {
      for (const t of tiles(box)) {
        const r = toScreen(camera, t, W, H);
        ctx.drawImage(images[tile], 0, 0, (8 * t.w) / TILE, (8 * t.h) / TILE, r.x, r.y, r.w, r.h);
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
