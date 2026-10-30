import { afterEach, describe, expect, it } from "vitest";
import { Debug, Destroy, GameObject, GUI, Input, Instantiate, KeyCode, MonoBehaviour, Rect, releaseAllKeys, Vector2, type Box } from "./engine";
import { createRun } from "./run-frame";

const boxes: Box[] = [
  { tag: "Player", x: 0, y: 0, w: 20, h: 20, color: "orange", script: "Player" },
  { tag: "Coin", x: 25, y: 0, w: 10, h: 10, color: "gold" },
];

class Player extends MonoBehaviour {
  private made = false;
  Update() {
    if (this.gameObject.tag !== "Player") return;
    if (this.made) {
      if (Input.GetKey(KeyCode.RightArrow)) this.transform.position = this.transform.position.Add(new Vector2(1, 0));
    } else if (Input.GetKeyDown(KeyCode.RightArrow)) {
      this.transform.position = this.transform.position.Add(new Vector2(1, 0));
      const coin = GameObject.FindGameObjectsWithTag("Coin")[0];
      if (coin) Destroy(coin);
      Instantiate({ tag: "Bullet", w: 4, h: 4, color: "white" }, new Vector2(5, 5));
      this.audio.PlayOneShot("Coin");
      Debug.Log("collected");
      this.made = true;
    }
    if (Input.GetKeyDown(KeyCode.DownArrow)) this.transform.position = new Vector2(this.transform.position.x, -10);
  }
  OnGUI() { GUI.Label(new Rect(0, 0, 100, 20), "Hello"); }
}

describe("one Run frame", () => {
  afterEach(() => releaseAllKeys());
  it("never passes a Sandbox Run with no Goals", () => {
    const run = createRun({ level: { boxes }, goals: [], lose: [], classes: { Player }, earned: new Set(), v2: true });
    const frame = run.step();
    if ("error" in frame) throw frame.error;
    expect(frame.check).toEqual({ met: [], passed: false });
  });

  it("returns console lines before a runtime error", () => {
    class Bad extends MonoBehaviour {
      Update() { Debug.Log("before error"); throw new Error("boom"); }
    }
    const run = createRun({ level: { boxes: [{ ...boxes[0], script: "Bad" }] }, goals: [], lose: [],
      classes: { Bad }, earned: new Set(), v2: true });
    const frame = run.step();
    expect(frame).toMatchObject({ error: expect.objectContaining({ message: "boom" }), lines: [{ text: "before error", level: "log", count: 1 }] });
  });

  it("returns input, world changes, Goals, Lose, Achievements, sounds, GUI and console lines", () => {
    const run = createRun({ level: { boxes }, goals: [{ message: "move", test: (w) => w.some((o) => o.tag === "Player" && o.x >= 2) }],
      lose: [{ test: (w) => w.some((o) => o.tag === "Player" && o.y < 0), message: "fell" }],
      classes: { Player }, earned: new Set<string>(), v2: true });
    run.input(KeyCode.RightArrow, true);
    const first = run.step();
    if ("error" in first) throw first.error;
    expect(first.objects.map((o) => o.tag)).toEqual(["Player", "Bullet"]);
    expect(first.check).toEqual({ met: [false], passed: false });
    expect(first.sounds).toEqual(["Coin"]);
    expect(first.labels.map((l) => l.text)).toEqual(["Hello"]);
    expect(first.lines).toEqual([expect.objectContaining({ text: "collected" })]);
    const second = run.step();
    if ("error" in second) throw second.error;
    expect(second.check).toEqual({ met: [true], passed: true });
    expect(second.earned).toContain("steps");
    run.input(KeyCode.DownArrow, true);
    const lost = run.step();
    if ("error" in lost) throw lost.error;
    expect(lost.check).toEqual({ met: [false], passed: false, lost: "fell" });
  });
});
