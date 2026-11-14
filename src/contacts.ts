import type { GameObject, MonoBehaviour } from "./engine";

type Pair = [GameObject, GameObject];
type Event = "OnTriggerEnter2D" | "OnTriggerStay2D" | "OnTriggerExit2D";

/** One instance per Run. Positions are sampled before any callback can move an object. */
export function contactNotifications() {
  let previous: Pair[] = [];
  const ids = new WeakMap<GameObject, number>();
  let nextId = 0;
  return (eligible: GameObject[], behaviours: MonoBehaviour[]) => {
    const boxes = eligible.filter((o) => o.collider && !o.destroyed).map((o) => {
      if (!ids.has(o)) ids.set(o, nextId++);
      return { o, x: o.transform.position.x, y: o.transform.position.y };
    });
    const current: Pair[] = [];
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.o.w > 0 && a.o.h > 0 && b.o.w > 0 && b.o.h > 0 &&
        a.x < b.x + b.o.w && a.x + a.o.w > b.x && a.y < b.y + b.o.h && a.y + a.o.h > b.y)
        current.push([a.o, b.o]);
    }
    const has = (pairs: Pair[], [a, b]: Pair) => pairs.some(([x, y]) => a === x && b === y);
    const events: { pair: Pair; event: Event }[] = current.map((pair) => ({ pair, event: has(previous, pair) ? "OnTriggerStay2D" : "OnTriggerEnter2D" }));
    for (const pair of previous) if (!has(current, pair)) events.push({ pair, event: "OnTriggerExit2D" });
    events.sort((a, b) => ids.get(a.pair[0])! - ids.get(b.pair[0])! || ids.get(a.pair[1])! - ids.get(b.pair[1])!);
    previous = [];
    const scripts = new Map(behaviours.map((b) => [b.gameObject, b]));
    for (const { pair: [a, b], event } of events) {
      if (event === "OnTriggerEnter2D" && (a.destroyed || b.destroyed)) continue;
      // Keep established pairs destroyed by callbacks until the next pass emits Exit.
      if (event !== "OnTriggerExit2D") previous.push([a, b]);
      for (const [self, other] of [[a, b], [b, a]]) {
        if (self.destroyed || (event !== "OnTriggerExit2D" && other.destroyed)) continue;
        const script = scripts.get(self);
        script?.[event]?.(other.collider!);
      }
    }
  };
}
