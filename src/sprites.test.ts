import { describe, expect, it } from "vitest";
import { v2Features } from "./run-utils";
import { fitSize, frameOf, imageFileError, playerFrames, tileCells, tiles, urls } from "./sprites";

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

describe("Null Signal Player", () => {
  it("loads five native 32×32 frames, and the Player tag draws the still idle pose", () => {
    for (const name of ["PlayerIdle", "PlayerIdleBlink", "PlayerWalk1", "PlayerWalk2", "PlayerJump"] as const) {
      expect(urls[name]).toBe(playerFrames[name]);
      const png = new DataView(Uint8Array.from(atob(pngs[`./sprites/${name}.png`].split(",")[1]), (c) => c.charCodeAt(0)).buffer);
      expect([png.getUint32(16), png.getUint32(20)]).toEqual([32, 32]); // IHDR width, height
    }
    expect(urls.Player).toBe(playerFrames.PlayerIdle);
  });
});

describe("frameOf", () => {
  const still = { x: 0, y: 0 };
  it("idles when still, cycling an idle loop at 8 fps", () => {
    expect(frameOf("Player", still, 0)).toBe("PlayerIdle");
    expect(frameOf("Player", still, 0.875)).toBe("PlayerIdleBlink");
    expect(frameOf("Player", still, 1)).toBe("PlayerIdle");
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

describe("v2Features", () => {
  it("is off in Lessons 1–15 and on in Chapter 2 and Sandbox", () => {
    for (let lesson = 0; lesson < 15; lesson++) expect(v2Features({ lesson })).toBe(false);
    expect(v2Features({ lesson: 15 })).toBe(true);
    expect(v2Features({ level: { boxes: [] } })).toBe(true);
  });
});

describe("own sprites", () => {
  it("refuses files that aren't PNG or JPEG", () => {
    expect(imageFileError({ type: "image/png" })).toBe("");
    expect(imageFileError({ type: "image/jpeg" })).toBe("");
    for (const type of ["image/gif", "image/svg+xml", "image/webp", "text/plain", ""]) expect(imageFileError({ type })).not.toBe("");
  });
  it("scales a big image down to fit 256×256, keeping its shape; small ones stay", () => {
    expect(fitSize(512, 300)).toEqual({ w: 256, h: 150 });
    expect(fitSize(100, 1000)).toEqual({ w: 26, h: 256 });
    expect(fitSize(16, 16)).toEqual({ w: 16, h: 16 });
  });
  it("tiles a box in 20 px cells, the first row with the Top image when there is one", () => {
    const box = { x: 0, y: 0, w: 50, h: 40 };
    const plain = tileCells(box, "fill");
    expect(plain).toHaveLength(6);
    expect(plain.every(([, img]) => img === "fill")).toBe(true);
    expect(plain[2]).toEqual([{ x: 40, y: 20, w: 10, h: 20 }, "fill"]);
    const topped = tileCells(box, "fill", "top");
    expect(topped.map(([, img]) => img)).toEqual(["top", "top", "top", "fill", "fill", "fill"]);
  });
});
