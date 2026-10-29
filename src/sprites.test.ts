import { describe, expect, it } from "vitest";
import { animates } from "./run-utils";
import { frameOf, playerFrames, tiles, urls } from "./sprites";

describe("tiles", () => {
  it("covers a box with whole tiles when it fits exactly", () => {
    expect(tiles({ x: 0, y: 0, w: 960, h: 48 }, 24)).toHaveLength(80);
  });
  it("cuts the right column and bottom row short, keeping the top row whole", () => {
    const t = tiles({ x: 10, y: 0, w: 60, h: 30 }, 24);
    expect(t).toHaveLength(6);
    expect(t[0]).toEqual({ x: 10, y: 6, w: 24, h: 24 });
    expect(t[2]).toEqual({ x: 58, y: 6, w: 12, h: 24 });
    expect(t[5]).toEqual({ x: 58, y: 0, w: 12, h: 6 });
  });
  it("makes one row the box's height when rows are that tall", () => {
    const t = tiles({ x: 0, y: 40, w: 80, h: 16 }, 20, 16);
    expect(t).toHaveLength(4);
    expect(t[3]).toEqual({ x: 60, y: 40, w: 20, h: 16 });
  });
});

const pngs: Record<string, string> = import.meta.glob("./sprites/Player*.png", { query: "?inline", import: "default", eager: true });

describe("Player critter", () => {
  it("has its four 16×16 frames loadable by name, and the Player tag draws idle", () => {
    for (const name of ["PlayerIdle", "PlayerWalk1", "PlayerWalk2", "PlayerJump"] as const) {
      expect(urls[name]).toBe(playerFrames[name]);
      const png = new DataView(Uint8Array.from(atob(pngs[`./sprites/${name}.png`].split(",")[1]), (c) => c.charCodeAt(0)).buffer);
      expect([png.getUint32(16), png.getUint32(20)]).toEqual([16, 16]); // IHDR width, height
    }
    expect(urls.Player).toBe(playerFrames.PlayerIdle);
  });
});

describe("frameOf", () => {
  const still = { x: 0, y: 0 };
  it("idles when still, cycling an idle loop at 8 fps", () => {
    expect(frameOf("Player", still, 0)).toBe("PlayerIdle");
    expect(frameOf("Player", { x: 0, y: -3 }, 0.5)).toBe("PlayerIdle"); // falling is not jumping
    expect([0, 0.125, 0.25].map((t) => frameOf("Coin", still, t))).toEqual(["Coin", "CoinSpin", "Coin"]);
  });
  it("walks while moving sideways", () => {
    expect([0, 0.13, 0.26].map((t) => frameOf("Player", { x: -2, y: 0 }, t))).toEqual(["PlayerWalk1", "PlayerWalk2", "PlayerWalk1"]);
    expect(frameOf("Enemy", { x: 1, y: 0 }, 0.13)).toBe("EnemyWalk");
  });
  it("jumps while moving up, even sideways; a tag without a jump frame idles", () => {
    expect(frameOf("Player", { x: 3, y: 4 }, 0.13)).toBe("PlayerJump");
    expect(frameOf("Enemy", { x: 0, y: 4 }, 0.13)).toBe("Enemy");
  });
  it("has no frame for a tag without a sprite, and every frame is a loaded image", () => {
    expect(frameOf("Ground", still, 0)).toBeUndefined();
    expect(frameOf("toString", still, 0)).toBeUndefined();
    for (const tag of ["Player", "Enemy", "Coin", "Flag", "Bullet"])
      for (const moved of [still, { x: 1, y: 0 }, { x: 0, y: 1 }])
        for (const t of [0, 0.13]) expect(urls).toHaveProperty(frameOf(tag, moved, t)!);
  });
});

describe("animates", () => {
  it("is off in Lessons 1–15 and on in Chapter 2 and Sandbox", () => {
    for (let lesson = 0; lesson < 15; lesson++) expect(animates({ lesson })).toBe(false);
    expect(animates({ lesson: 15 })).toBe(true);
    expect(animates({ level: { boxes: [] } })).toBe(true);
  });
});
