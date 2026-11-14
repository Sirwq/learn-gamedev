import { expect, it } from "vitest";
import { Collider2D, Destroy, Instantiate, MonoBehaviour, Vector2, startGame, type Box } from "./engine";

const box = (tag: string, x = 0, extras: Partial<Box> = {}): Box => ({ tag, x, y: 0, w: 20, h: 20, color: "red", script: "Sensor", collider: true, ...extras });
function fixture(level: Box[]) {
  const events: string[] = [];
  class Sensor extends MonoBehaviour {
    OnTriggerEnter2D(other: Collider2D) { events.push(`${this.gameObject.tag}:enter:${other.gameObject.tag}`); }
    OnTriggerStay2D(other: Collider2D) { events.push(`${this.gameObject.tag}:stay:${other.gameObject.tag}`); }
    OnTriggerExit2D(other: Collider2D) { events.push(`${this.gameObject.tag}:exit:${other.gameObject.tag}`); }
  }
  return { events, Sensor, run: startGame(level, { Sensor }) };
}
it("notifies strict overlap in order, without moving objects; edges and disabled sensors do nothing", () => {
  const { run, events } = fixture([box("A", 10), box("B", 30), box("C", 30, { collider: false })]);
  run.step(); expect(events).toEqual([]);
  run.objects[0].transform.position = new Vector2(11, 0);
  const sensor = run.objects[0].collider;
  run.step(); run.step(); run.step();
  expect(events).toEqual(["A:enter:B", "B:enter:A", "A:stay:B", "B:stay:A", "A:stay:B", "B:stay:A"]);
  expect(run.objects[0].transform.position).toEqual(new Vector2(11, 0));
  expect(run.objects[0].collider).toBe(sensor);
  run.objects[0].transform.position = new Vector2(0, 0);
  run.step(); run.step();
  expect(events.slice(6)).toEqual(["A:exit:B", "B:exit:A"]);
});
it("detects scriptless objects, duplicate tags and initial overlap, but not zero area or missing opt-in", () => {
  const { run, events } = fixture([box("A"), box("Coin", 1, { script: undefined }), box("Coin", 2, { script: undefined }), box("Zero", 0, { w: 0 }), box("Old", 0, { collider: undefined })]);
  run.step(); expect(events).toEqual(["A:enter:Coin", "A:enter:Coin"]);
});
it("suppresses destroyed callbacks and exits once on the surviving script next step", () => {
  const events: string[] = [];
  class Collector extends MonoBehaviour {
    OnTriggerEnter2D(other: Collider2D) { events.push(this.gameObject.tag + ":enter"); Destroy(other.gameObject); }
    OnTriggerExit2D(other: Collider2D) { events.push(this.gameObject.tag + ":exit:" + other.gameObject.destroyed); }
  }
  const run = startGame([box("A", 0, { script: "Collector" }), box("B", 1, { script: "Collector" })], { Collector });
  run.step(); expect(events).toEqual(["A:enter"]);
  run.step(); run.step(); expect(events).toEqual(["A:enter", "A:exit:true"]);
});
it("reports destruction during Update and resets contact history on new Run", () => {
  const events: string[] = [];
  let kill = false;
  class Sensor extends MonoBehaviour {
    Update() { if (kill && this.gameObject.tag === "B") Destroy(this.gameObject); }
    OnTriggerEnter2D() { events.push(this.gameObject.tag + ":enter"); }
    OnTriggerExit2D() { events.push(this.gameObject.tag + ":exit"); }
  }
  const run = startGame([box("A"), box("B", 1)], { Sensor });
  run.step(); kill = true; run.step(); run.step();
  expect(events).toEqual(["A:enter", "B:enter", "A:exit"]);
  kill = false;
  startGame([box("A"), box("B", 1)], { Sensor }).step();
  expect(events.slice(3)).toEqual(["A:enter", "B:enter"]);
});
it("snapshots callback movement and defers callback-spawned objects until Start", () => {
  const events: string[] = [];
  class Sensor extends MonoBehaviour {
    Start() { events.push(this.gameObject.tag + ":start"); }
    OnTriggerEnter2D(other: Collider2D) {
      events.push(this.gameObject.tag + ":enter:" + other.gameObject.tag);
      if (this.gameObject.tag === "A" && other.gameObject.tag === "B") {
        other.transform.position = new Vector2(100, 0);
        Instantiate({ tag: "D", w: 20, h: 20, color: "red", script: "Sensor", collider: true }, new Vector2(0, 0));
      }
    }
  }
  const run = startGame([box("A"), box("B", 1), box("C", 2)], { Sensor });
  run.step();
  expect(events).toContain("B:enter:C");
  expect(events.some((x) => x.includes("D"))).toBe(false);
  run.step();
  expect(events.indexOf("D:start")).toBeLessThan(events.indexOf("A:enter:D"));
});
it("defers Update spawns, including scriptless objects, and propagates callback errors before OnGUI", () => {
  let enters = 0, gui = 0, spawned = false;
  class Sensor extends MonoBehaviour {
    Update() { if (!spawned) { spawned = true; Instantiate({ tag: "B", w: 20, h: 20, color: "red", collider: true }, new Vector2(0, 0)); } }
    OnTriggerEnter2D() { enters++; throw new Error("contact failed"); }
    OnGUI() { gui++; }
  }
  const run = startGame([box("A")], { Sensor });
  run.step(); expect(enters).toBe(0); expect(gui).toBe(1);
  expect(() => run.step()).toThrow("contact failed"); expect(gui).toBe(1);
});

it("does not invent Exit for a new pair suppressed by an earlier destruction", () => {
  const events: string[] = [];
  class Sensor extends MonoBehaviour {
    OnTriggerEnter2D(other: Collider2D) {
      events.push(`${this.gameObject.tag}:enter:${other.gameObject.tag}`);
      if (other.gameObject.tag === "B") Destroy(other.gameObject);
    }
    OnTriggerExit2D(other: Collider2D) { events.push(`${this.gameObject.tag}:exit:${other.gameObject.tag}`); }
  }
  const run = startGame([box("A"), box("B", 1), box("C", 2)], { Sensor });
  run.step(); run.step();
  expect(events).toEqual(["A:enter:B", "A:enter:C", "C:enter:A", "A:exit:B"]);
});
