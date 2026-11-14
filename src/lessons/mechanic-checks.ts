import { Time, type World } from "../engine";
import { find, overlaps, type Check } from "../lesson";

/** Observe a journey, rather than accepting a single teleport to the flag. */
export function steadyTravel(startX: number, distance: number): Check["test"] {
  let x = startX, previousStep = 0, travelled = 0, frames = 0;
  return (world, time) => {
    if (time <= Time.deltaTime) { x = startX; previousStep = 0; travelled = 0; frames = 0; }
    const next = find(world, "Player").x;
    const step = next - x;
    if (step > 0 && (frames === 0 || Math.abs(step - previousStep) < 0.01)) {
      travelled += step;
      frames++;
    } else { travelled = 0; frames = 0; }
    x = next;
    previousStep = step;
    return frames >= 12 && travelled >= distance;
  };
}

/** Static coins in this lesson have distinct positions, so no new runtime identity is needed. */
export function collectOnContact(start: () => World): Check["test"] {
  let remaining: World = [], collected = 0, valid = true;
  let previousPlayer: World[number] | undefined;
  return (world, time) => {
    if (time <= Time.deltaTime) { remaining = start().filter(o => o.tag === "Coin"); collected = 0; valid = true; previousPlayer = start().find(o => o.tag === "Player"); }
    const removed = remaining.filter(c => !world.some(o => o.tag === "Coin" && o.x === c.x && o.y === c.y));
    if (removed.length) {
      valid &&= removed.every(c => overlaps(find(world, "Player"), c) || !!previousPlayer && overlaps(previousPlayer, c));
      collected += removed.length;
      valid &&= world.logs.some(line => line.level === "log" && line.text.match(/\d+/g)?.includes(String(collected)));
      remaining = remaining.filter(c => !removed.includes(c));
    }
    previousPlayer = find(world, "Player");
    return valid && collected > 0 && remaining.length === 0;
  };
}

/** Track visible travel before accepting an enemy's disappearance at the bullet's next position. */
export function bulletHit(start: () => World): Check["test"] {
  let previous: World = [], before: World = [];
  return (world, time) => {
    if (time <= Time.deltaTime) { previous = start(); before = []; }
    const hit = previous.filter(e => e.tag === "Enemy").some(enemy =>
      !world.some(e => e.tag === "Enemy" && e.x === enemy.x && e.y === enemy.y) &&
      previous.filter(b => b.tag === "Bullet").some(bullet => before.some(old => {
        if (old.tag !== "Bullet" || old.y !== bullet.y) return false;
        const dx = bullet.x - old.x;
        // shortcut: this lesson uses horizontal bullets and a stationary target; extend for other trajectories.
        return dx > 0 && dx <= 100 && overlaps({ ...bullet, x: bullet.x + dx }, enemy);
      })));
    before = previous;
    previous = world;
    return hit;
  };
}

export function carriedByPlatform(): Check["test"] {
  let previous: World | undefined, carried = 0;
  return (world, time) => {
    if (time <= Time.deltaTime) { previous = undefined; carried = 0; }
    const player = find(world, "Player"), platform = find(world, "Platform");
    if (previous) {
      const oldPlayer = find(previous, "Player"), oldPlatform = find(previous, "Platform");
      const dx = platform.x - oldPlatform.x;
      const standing = (p: World[number], b: World[number]) => Math.abs(p.y - b.y - b.h) < 2 && p.x < b.x + b.w && p.x + p.w > b.x;
      if (standing(player, platform) && standing(oldPlayer, oldPlatform) && Math.abs(dx) > 0.01
        && Math.abs(player.x - oldPlayer.x - dx) < 0.01) carried += Math.abs(dx);
    }
    previous = world;
    return carried >= 100;
  };
}

export function stompContact(): Check["test"] {
  let previous: World | undefined;
  return (world, time) => {
    if (time <= Time.deltaTime) previous = undefined;
    const player = find(world, "Player");
    const old = previous && find(previous, "Player");
    const stomped = !!old && player.y < old.y && previous!.some(enemy => enemy.tag === "Enemy"
      && world.filter(o => o.tag === "Enemy").length < previous!.filter(o => o.tag === "Enemy").length
      && player.x < enemy.x + enemy.w && player.x + player.w > enemy.x
      && ((overlaps(player, enemy) && player.y > enemy.y + enemy.h / 2)
        || (old.y >= enemy.y + enemy.h && player.y <= enemy.y + enemy.h && player.y >= enemy.y + enemy.h - 2)));
    previous = world;
    return stomped;
  };
}
