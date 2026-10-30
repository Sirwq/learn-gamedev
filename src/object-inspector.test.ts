import { describe, expect, it } from "vitest";
import { Destroy, Instantiate, MonoBehaviour, startGame, Vector2 } from "./engine";
import { nextSelection, objectSnapshots, startingObjects, selectedObject } from "./object-inspector";

describe("Objects snapshots", () => {
  it("keeps identity across movement, distinguishes duplicate tags, and follows creation and destruction", () => {
    let spawned = false;
    class Player extends MonoBehaviour {
      Update() {
        this.transform.position = this.transform.position.Add(new Vector2(1, 0));
        if (!spawned) {
          spawned = true;
          Instantiate({ tag: "Coin", w: 8, h: 8, color: "gold" }, new Vector2(5, 5));
        } else Destroy(this.gameObject);
      }
    }
    const boxes = [
      { tag: "Player", x: 0, y: 0, w: 32, h: 32, color: "orange", script: "Player" },
      { tag: "Ground", x: 0, y: -10, w: 50, h: 10, color: "green" },
      { tag: "Ground", x: 50, y: -10, w: 50, h: 10, color: "green" },
    ];
    const stopped = startingObjects(boxes);
    expect(stopped.map((o) => o.id)).toEqual(["level:0", "level:1", "level:2"]);
    expect(stopped[0].script).toBe("Player");
    const game = startGame(boxes, { Player });
    const snapshot = objectSnapshots();
    const first = snapshot(game.objects);
    expect(new Set(first.map((o) => o.id)).size).toBe(3);
    game.step();
    const second = snapshot(game.objects);
    expect(second.map((o) => o.id).slice(0, 3)).toEqual(first.map((o) => o.id));
    expect(selectedObject(second, first[0].id)?.x).toBe(1);
    expect(second[3]).toMatchObject({ tag: "Coin", x: 5, y: 5, script: undefined });
    game.step();
    const third = snapshot(game.objects);
    expect(selectedObject(third, first[0].id)).toBeUndefined();
    expect(nextSelection(first[0].id, third)).toBe(first[0].id);
    expect(selectedObject(third, second[3].id)?.tag).toBe("Coin");
    const restored = startingObjects(boxes);
    expect(nextSelection(first[0].id, restored, true)).toBe(restored[0].id);
    expect(restored[0].x).toBe(0);
  });
});
