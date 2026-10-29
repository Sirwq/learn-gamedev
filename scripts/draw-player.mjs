// Draws the Player critter frames (16×16, ticket 058) into src/sprites. Run: node scripts/draw-player.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const colors = {
  o: [0x5a, 0x2b, 0x1e], // outline, so it reads in front of a Brick wall
  O: [0xd9, 0x77, 0x57],
  S: [0xa9, 0x58, 0x3e],
  H: [0xf2, 0xa9, 0x8a],
  E: [0x1f, 0x1a, 0x17],
  W: [0xff, 0xff, 0xff],
};
const body = [
  "......oooo......",
  "......oHOo......",
  "...oooooooooo...",
  "..oHHOOOOOOOOo..",
  ".oHOOOOOOOOOOOo.",
  ".oHOOOWEOOOWEOo.",
  ".oOOOOWEOOOWEOo.",
  ".oOOOOWWOOOWWOo.",
  ".oOOOOOOOOOOOOo.",
  ".oSOOOOOOOOOOSo.",
  ".oSSOOOOOOOOSSo.",
  "..oSSSSSSSSSSo..",
  "...oooooooooo...",
];
const frames = {
  PlayerIdle: [...body, "...oSSo..oSSo...", "...oSSo..oSSo...", "...oooo..oooo..."],
  PlayerWalk1: [...body, "..oSSo....oSSo..", "..oSSo....oooo..", "..oooo.........."],
  PlayerWalk2: [...body, "..oSSo....oSSo..", "..oooo....oSSo..", "..........oooo.."],
  PlayerJump: [...body, "..oSSo....oSSo..", "..oooo....oooo..", "................"],
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
  ihdr.writeUInt32BE(16, 0);
  ihdr.writeUInt32BE(16, 4);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
  const raw = Buffer.concat(
    rows.map((row) => {
      if (row.length !== 16) throw new Error(`row is ${row.length} wide: ${row}`);
      return Buffer.from([0, ...[...row].flatMap((ch) => (ch === "." ? [0, 0, 0, 0] : [...colors[ch], 255]))]);
    }),
  );
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

for (const [name, rows] of Object.entries(frames)) {
  if (rows.length !== 16) throw new Error(`${name} is ${rows.length} tall`);
  writeFileSync(new URL(`../src/sprites/${name}.png`, import.meta.url), png(rows));
}
