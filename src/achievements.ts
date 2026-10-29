import { Camera, type World } from "./engine";
import { overlaps } from "./lesson";

/** What an Achievement test sees besides this frame: the Level's start, the last frame, and its own memory for this Run. */
export type Run = { start: World; prev: World; logged: boolean; seen: Set<string> };

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
};

type Obj = World[number];
const player = (w: World) => w.find((o) => o.tag === "Player");
const count = (w: World, tag: string) => w.filter((o) => o.tag === tag).length;
const at = (w: World, o: Obj) => w.some((q) => q.tag === o.tag && q.x === o.x && q.y === o.y);
const standsOn = (p: Obj, o: Obj) => Math.abs(p.y - (o.y + o.h)) < 2 && p.x < o.x + o.w && o.x < p.x + p.w;
const grow = (o: Obj, by: number) => ({ x: o.x - by, y: o.y - by, w: o.w + 2 * by, h: o.h + 2 * by });
// shortcut: no object ids, so "an enemy died" is the Enemy count dropping; upgrade if Levels get many enemies close together.
const killed = (w: World, prev: World, by: (e: Obj) => boolean) =>
  count(w, "Enemy") < count(prev, "Enemy") && prev.some((e) => e.tag === "Enemy" && by(e));

/** With `p` the Player now and `q` the Player last frame, when both exist. */
const moved = (f: (p: Obj, q: Obj, world: World, run: Run) => boolean) => (world: World, run: Run) => {
  const p = player(world), q = player(run.prev);
  return !!p && !!q && f(p, q, world, run);
};

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
];

/** Earned (gold), locked (grey: the one before is earned, so it can be earned now), or hidden (`?`: further on). */
export const stateOf = (a: Pick<Achievement, "id" | "after">, earned: Set<string>) =>
  earned.has(a.id) ? "earned" : !a.after || earned.has(a.after) ? "locked" : "hidden";

/** One per Run: call every frame. Checks only locked Achievements, adds the ones met to `earned` and returns their ids. */
export function achievementChecker(start: World, earned: Set<string>, list = achievements) {
  const seen = new Map(list.map((a) => [a.id, new Set<string>()]));
  let prev: World | undefined;
  return (world: World, logged = false) => {
    const run = { start, prev: prev ?? world, logged };
    const met = list.filter((a) => stateOf(a, earned) === "locked" && a.test(world, { ...run, seen: seen.get(a.id)! }));
    for (const a of met) earned.add(a.id);
    prev = world;
    return met.map((a) => a.id);
  };
}

const key = (id: string) => `achievement:${id}`;
export const saveEarned = (id: string, store: Pick<Storage, "setItem"> = localStorage) => store.setItem(key(id), "1");
export const loadEarned = (store: Pick<Storage, "getItem"> = localStorage) =>
  new Set(achievements.filter((a) => store.getItem(key(a.id)) === "1").map((a) => a.id));
