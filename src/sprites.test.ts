import { describe, expect, it } from "vitest";
import { playerFrames, tiles, urls } from "./sprites";

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
