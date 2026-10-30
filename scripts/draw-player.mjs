// Reproducible 32×32 Null Signal Player art. Run: node scripts/draw-player.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const colors = {
  o: [0x0d, 0x0c, 0x15], // silhouette
  b: [0x2a, 0x28, 0x39], // body and monitor shadow
  m: [0x51, 0x4c, 0x60], // monitor rim
  h: [0x8b, 0x85, 0x9b], // highlight against dark Sky and Brick
  s: [0x09, 0x0b, 0x13], // glass
  r: [0xff, 0x44, 0x40], // NULL letters
  d: [0x82, 0x1a, 0x24], // dim red glow
};
const glyphs = {
  N: ["101", "111", "111", "111", "101"],
  U: ["101", "101", "101", "101", "111"],
  L: ["100", "100", "100", "100", "111"],
};

function frame(pose) {
  const grid = Array.from({ length: 32 }, () => Array(32).fill("."));
  const dot = (x, y, c) => { if (x >= 0 && x < 32 && y >= 0 && y < 32) grid[y][x] = c; };
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) dot(xx, yy, c); };

  // Bent antenna, with a one-pixel shift during the brief idle expression.
  rect(14, 0, 4, 2, "o");
  rect(12, 2, 3, 2, "m");
  rect(11, 4, 2, 3, "m");
  rect(pose === "blink" ? 16 : 17, 2, 3, 3, "b");
  dot(pose === "blink" ? 16 : 18, 2, "h");

  // Monitor bezel, inset glass and cool highlights.
  rect(5, 6, 22, 17, "o");
  rect(4, 8, 24, 13, "o");
  rect(6, 7, 20, 15, "m");
  rect(5, 9, 22, 11, "m");
  rect(7, 9, 18, 11, "b");
  rect(8, 10, 16, 9, "s");
  rect(6, 7, 19, 1, "h");
  rect(5, 9, 1, 10, "h");
  rect(8, 20, 16, 1, "b");
  rect(10, 18, 12, 1, "d");
  if (pose === "blink") {
    rect(12, 14, 3, 1, "r");
    rect(17, 14, 3, 1, "r");
  } else {
    let x = 9;
    for (const letter of "NULL") {
      glyphs[letter].forEach((row, y) => [...row].forEach((pixel, dx) => { if (pixel === "1") dot(x + dx, 12 + y, "r"); }));
      x += 4;
    }
  }

  // Small torso, badge and pose-specific arms and feet. Feet reach the box edge.
  rect(11, 23, 10, 7, "o");
  rect(12, 23, 8, 6, "b");
  rect(14, 25, 4, 3, "m");
  dot(15, 25, "h");
  dot(16, 27, "o");
  if (pose === "jump") {
    rect(7, 22, 4, 2, "m"); rect(5, 20, 3, 3, "m");
    rect(21, 22, 4, 2, "m"); rect(25, 20, 3, 3, "m");
    rect(9, 29, 6, 2, "o"); rect(17, 29, 6, 2, "o");
    rect(9, 30, 3, 2, "m"); rect(20, 30, 3, 2, "m");
  } else {
    rect(8, 23, 3, 5, "m"); rect(21, 23, 3, 5, "m");
    if (pose === "walk1") {
      rect(10, 29, 4, 2, "m"); rect(8, 31, 7, 1, "o");
      rect(19, 28, 3, 3, "m"); rect(19, 31, 5, 1, "o");
    } else if (pose === "walk2") {
      rect(10, 28, 3, 3, "m"); rect(8, 31, 5, 1, "o");
      rect(18, 29, 4, 2, "m"); rect(18, 31, 7, 1, "o");
    } else {
      rect(11, 29, 3, 2, "m"); rect(10, 31, 5, 1, "o");
      rect(18, 29, 3, 2, "m"); rect(17, 31, 5, 1, "o");
    }
  }
  return grid.map((row) => row.join(""));
}
const frames = {
  PlayerIdle: frame("idle"),
  PlayerIdleBlink: frame("blink"),
  PlayerWalk1: frame("walk1"),
  PlayerWalk2: frame("walk2"),
  PlayerJump: frame("jump"),
};

const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc = (buf) => {
  let c = ~0;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};
function png(rows) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(32, 0);
  ihdr.writeUInt32BE(32, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.concat(rows.map((row) => {
    if (row.length !== 32) throw new Error(`row is ${row.length} wide: ${row}`);
    return Buffer.from([0, ...[...row].flatMap((ch) => (ch === "." ? [0, 0, 0, 0] : [...colors[ch], 255]))]);
  }));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
for (const [name, rows] of Object.entries(frames)) {
  if (rows.length !== 32) throw new Error(`${name} is ${rows.length} tall`);
  writeFileSync(new URL(`../src/sprites/${name}.png`, import.meta.url), png(rows));
}
