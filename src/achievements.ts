import { Camera, type World } from "./engine";
import { overlaps } from "./lesson";

/** One checked frame: the boxes and the keys pressed this frame (what `Input.GetKeyDown` reads). */
export type Frame = { world: World; keysDown: ReadonlySet<string> };

/**
 * What an Achievement test sees besides this frame's boxes: the Level's start, the last frame, this frame's pressed keys,
 * the recent frames (oldest first, ending with this one) and its own memory for this Run.
 */
export type Run = { start: World; prev: World; logged: boolean; keysDown: ReadonlySet<string>; recent: Frame[]; seen: Set<string> };

export type Achievement = {
  id: string;
  /** The Achievement that unlocks this one; null for the root. */
  after: string | null;
  icon: string;
  title: string;
  /** How to earn it. */
  message: string;
  test: (world: World, run: Run) => boolean;
  /** Hand-placed map cell. */
  col: number;
  row: number;
  /** Draw the arrow down/up first, then across (default: across first). */
  vertical?: boolean;
  /** A Mechanic no Lesson teaches. */
  extra?: boolean;
};

type Obj = World[number];
const player = (w: World) => w.find((o) => o.tag === "Player");
const count = (w: World, tag: string) => w.filter((o) => o.tag === tag).length;
const at = (w: World, o: Obj) => w.some((q) => q.tag === o.tag && q.x === o.x && q.y === o.y);
const standsOn = (p: Obj, o: Obj) => Math.abs(p.y - (o.y + o.h)) < 2 && p.x < o.x + o.w && o.x < p.x + p.w;
const airborne = (w: World, p: Obj) => !w.some((o) => o !== p && standsOn(p, o));
/** The Wall whose side the Player touches (within 1 px, like Bonk). */
const wallBeside = (w: World, p: Obj) =>
  w.find((o) => o.tag === "Wall" && p.y < o.y + o.h && o.y < p.y + p.h && (Math.abs(p.x + p.w - o.x) < 1 || Math.abs(p.x - o.x - o.w) < 1));
const grow = (o: Obj, by: number) => ({ x: o.x - by, y: o.y - by, w: o.w + 2 * by, h: o.h + 2 * by });
// shortcut: no object ids, so "an enemy died" is the Enemy count dropping; upgrade if Levels get many enemies close together.
const killed = (w: World, prev: World, by: (e: Obj) => boolean) =>
  count(w, "Enemy") < count(prev, "Enemy") && prev.some((e) => e.tag === "Enemy" && by(e));

/** With `p` the Player now and `q` the Player last frame, when both exist. */
const moved = (f: (p: Obj, q: Obj, world: World, run: Run) => boolean) => (world: World, run: Run) => {
  const p = player(world), q = player(run.prev);
  return !!p && !!q && f(p, q, world, run);
};

const SECOND = 60; // frames
/** Frames the checker keeps: a Dash's 1 s plus the 10 frames before it, plus one for their speeds. */
const KEEP = SECOND + 12;

/** The Player's step from frame i - 1 to frame i of `recent`, if it is in both. */
const step = (recent: Frame[], i: number) => {
  const p = i > 0 && player(recent[i].world), q = i > 0 && player(recent[i - 1].world);
  return p && q ? { x: p.x - q.x, y: p.y - q.y } : undefined;
};

/** Space pressed while airborne, then within 3 frames a kick (an upward step at least 3 px bigger than the last) while still airborne. */
function doubleJump(world: World, { start, recent }: Run) {
  const n = recent.length - 1, p = player(world), s = player(start);
  const now = step(recent, n), before = step(recent, n - 1);
  if (!p || !s || !now || !before || now.y - before.y < 3) return false;
  // A coyote jump starts after a walk off; a double jump needs an earlier rise in the same airborne stretch.
  let roseBefore = false;
  for (let i = n - 1; i > 0; i--) {
    const prior = player(recent[i].world);
    if (!prior || !airborne(recent[i].world, prior)) break;
    if ((step(recent, i)?.y ?? 0) > 1) { roseBefore = true; break; }
  }
  if (!roseBefore) return false;
  for (let k = n; k >= Math.max(1, n - 3); k--) {
    const q = player(recent[k - 1].world), pk = player(recent[k].world);
    // A landing, a stomp bounce or a respawn between the press and the kick doesn't count.
    if (!pk || !airborne(recent[k].world, pk) || count(recent[k].world, "Enemy") < count(recent[k - 1].world, "Enemy") || (pk.x === s.x && pk.y === s.y)) return false;
    if (q && recent[k].keysDown.has("Space") && airborne(recent[k - 1].world, q)) return true;
  }
  return false;
}

/** Space pressed while airborne against a Wall's side, then within 10 frames rising and at least 20 px from that side. */
function wallJump(world: World, { recent }: Run) {
  const n = recent.length - 1, p = player(world), now = step(recent, n);
  if (!p || !now || now.y <= 0) return false;
  for (let k = n; k >= Math.max(1, n - 10); k--) {
    const q = player(recent[k - 1].world), wall = q && recent[k].keysDown.has("Space") && airborne(recent[k - 1].world, q) && wallBeside(recent[k - 1].world, q);
    if (wall && Math.max(wall.x - p.x - p.w, p.x - wall.x - wall.w) >= 20) return true;
  }
  return false;
}

/**
 * On a key-press frame, horizontal speed goes above both 2x its average over the 10 frames before and 600 px/s,
 * stays there for at least 4 frames and drops back within 1 s, not while riding a Platform.
 */
function dash(world: World, { recent }: Run) {
  const n = recent.length - 1;
  const speed = (i: number) => {
    const d = step(recent, i);
    return d && Math.abs(d.x) * SECOND;
  };
  const riding = (i: number) => {
    const p = player(recent[i].world);
    return !!p && recent[i].world.some((o) => o.tag === "Platform" && standsOn(p, o) && !at(recent[i - 1].world, o));
  };
  const v = speed(n);
  if (v === undefined) return false;
  for (let k = n - 4; k >= Math.max(11, n - SECOND); k--) {
    if (!recent[k].keysDown.size) continue;
    let sum = 0;
    for (let i = k - 10; i < k; i++) sum += speed(i) ?? NaN;
    const limit = Math.max((2 * sum) / 10, 600);
    if (!(v <= limit)) continue; // also skips a NaN limit: the Player was missing
    let ok = true;
    for (let i = k; i <= n && ok; i++) ok = (i === n || (speed(i) ?? 0) > limit) && !riding(i);
    if (ok) return true;
  }
  return false;
}

export const achievements: Achievement[] = [
  { id: "steps", after: null, col: 1, row: 4, icon: "👣", title: "First steps", message: "Move the player for the first time", test: moved((p, q) => p.x !== q.x) },
  { id: "log", after: "steps", col: 1, row: 2, icon: "💬", title: "Hello, Console", message: "Write your first Debug.Log", test: (_, run) => run.logged },
  {
    id: "both", after: "steps", col: 3, row: 7, vertical: true, icon: "↔️", title: "Both ways", message: "Move left and right in one Run",
    test: moved((p, q, _, { seen }) => (p.x !== q.x && seen.add(p.x < q.x ? "left" : "right"), seen.size === 2)),
  },
  { id: "fall", after: "steps", col: 3, row: 4, icon: "🪂", title: "Long way down", message: "Fall off the bottom of the screen", test: moved((p) => p.y + p.h < 0) },
  { id: "jump", after: "fall", col: 5, row: 4, icon: "🦘", title: "First jump", message: "Jump for the first time", test: moved((p, q) => p.y > q.y + 1) },
  {
    id: "land", after: "jump", col: 5, row: 2, icon: "📦", title: "Touchdown", message: "Land on a box",
    test: moved((p, _, w) => w.some((o) => (o.tag === "Platform" || o.tag === "Wall") && standsOn(p, o))),
  },
  {
    id: "bonk", after: "land", col: 5, row: 0, icon: "🧱", title: "Bonk", message: "Walk into a wall",
    test: moved((p, _, w) => w.some((o) => o.tag === "Wall" && p.y < o.y + o.h && o.y < p.y + p.h && (Math.abs(p.x + p.w - o.x) < 1 || Math.abs(p.x - o.x - o.w) < 1))),
  },
  {
    id: "hop", after: "land", col: 7, row: 2, icon: "🪜", title: "Platform hopper", message: "Stand on 3 platforms in one Run",
    test: moved((p, _, w, { seen }) => {
      for (const o of w) if (o.tag === "Platform" && standsOn(p, o)) seen.add(`${o.x},${o.y}`);
      return seen.size >= 3;
    }),
  },
  {
    id: "ride", after: "hop", col: 7, row: 0, icon: "🛗", title: "Along for the ride", message: "Ride a moving platform",
    test: moved((p, _, w, { prev }) => w.some((o) => o.tag === "Platform" && standsOn(p, o) && !at(prev, o))),
  },
  { id: "explore", after: "hop", col: 9, row: 2, icon: "🔭", title: "Off the edge", message: "Move the camera past the first screen", test: () => Camera.main.transform.position.x > 960 },
  { id: "coin", after: "explore", col: 9, row: 0, icon: "🪙", title: "First coin", message: "Collect a coin", test: (w, { prev }) => count(w, "Coin") < count(prev, "Coin") },
  { id: "allcoins", after: "coin", col: 11, row: 1, icon: "💰", title: "Collector", message: "Collect every coin in one Run", test: (w, { start }) => count(start, "Coin") > 0 && count(w, "Coin") === 0 },
  {
    id: "patrol", after: "explore", col: 9, row: 5, icon: "👾", title: "It's alive", message: "Make an enemy patrol",
    test: (w, { prev }) => w.some((e) => e.tag === "Enemy" && !at(prev, e)),
  },
  {
    // The enemy is gone the frame it is stomped, so look at where the Player was the frame before (both may have moved since).
    id: "stomp", after: "patrol", col: 11, row: 4, icon: "🥾", title: "First stomp", message: "Stomp an enemy",
    test: moved((_, q, w, { prev }) => killed(w, prev, (e) => q.x - 10 < e.x + e.w && e.x < q.x + q.w + 10 && q.y >= e.y + e.h / 2)),
  },
  { id: "ouch", after: "patrol", col: 9, row: 7, icon: "🤕", title: "Ouch", message: "Get hurt by an enemy", test: moved((p, _, w) => w.some((e) => e.tag === "Enemy" && overlaps(p, e))) },
  {
    // A respawn is a jump back to the start in one frame.
    id: "respawn", after: "ouch", col: 11, row: 8, icon: "❤️", title: "Second chance", message: "Respawn after losing all health",
    test: moved((p, q, _, { start }) => {
      const s = player(start);
      return !!s && p.x === s.x && p.y === s.y && Math.hypot(q.x - s.x, q.y - s.y) > 100;
    }),
  },
  { id: "pew", after: "patrol", col: 7, row: 5, icon: "✨", title: "Pew", message: "Fire a bullet", test: (w) => w.some((o) => o.tag === "Bullet") },
  {
    id: "snipe", after: "pew", col: 5, row: 7, vertical: true, icon: "🎯", title: "Sharpshooter", message: "Hit an enemy with a bullet",
    test: (w, { prev }) => killed(w, prev, (e) => prev.some((b) => b.tag === "Bullet" && overlaps(b, grow(e, 20)))),
  },
  { id: "doublejump", after: "jump", col: 7, row: 4, icon: "⏫", title: "Double jump", message: "Jump again in mid-air", extra: true, test: doubleJump },
  { id: "walljump", after: "bonk", col: 3, row: 0, icon: "🧗", title: "Wall jump", message: "Jump off a wall", extra: true, test: wallJump },
  { id: "dash", after: "both", col: 3, row: 9, icon: "💨", title: "Dash", message: "Dash: a quick burst of speed", extra: true, test: dash },
];

/** Earned (gold), locked (grey: the one before is earned, so it can be earned now), or hidden (`?`: further on). */
export const stateOf = (a: Pick<Achievement, "id" | "after">, earned: Set<string>) =>
  earned.has(a.id) ? "earned" : !a.after || earned.has(a.after) ? "locked" : "hidden";

/**
 * One per Run: call every frame with whether anything was logged and the keys pressed this frame.
 * Checks only locked Achievements, adds the ones met to `earned` and returns their ids.
 */
export function achievementChecker(start: World, earned: Set<string>, list = achievements) {
  const seen = new Map(list.map((a) => [a.id, new Set<string>()]));
  const recent: Frame[] = [];
  return (world: World, { logged = false, keysDown = new Set<string>() }: { logged?: boolean; keysDown?: ReadonlySet<string> } = {}) => {
    const prev = recent.at(-1)?.world ?? world;
    recent.push({ world, keysDown });
    if (recent.length > KEEP) recent.shift();
    const run = { start, prev, logged, keysDown, recent };
    const met = list.filter((a) => stateOf(a, earned) === "locked" && a.test(world, { ...run, seen: seen.get(a.id)! }));
    for (const a of met) earned.add(a.id);
    return met.map((a) => a.id);
  };
}

const key = (id: string) => `achievement:${id}`;
export function saveEarned(id: string, store: Pick<Storage, "setItem"> = localStorage) {
  store.setItem(key(id), "1");
  store.setItem("saves:changed", String(Date.now())); // the backup reminder sees something new
}
export const loadEarned = (store: Pick<Storage, "getItem"> = localStorage) =>
  new Set(achievements.filter((a) => store.getItem(key(a.id)) === "1").map((a) => a.id));
