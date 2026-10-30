// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Destroy, Instantiate, MonoBehaviour, startGame, Vector2 } from "./engine";
import { objectInspector } from "./object-inspector";
import { objectSnapshots, startingObjects } from "./object-snapshots";

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
    expect(second.find((o) => o.id === first[0].id)?.x).toBe(1);
    expect(second[3]).toMatchObject({ tag: "Coin", x: 5, y: 5, script: undefined });
    game.step();
    const third = snapshot(game.objects);
    expect(third.find((o) => o.id === first[0].id)).toBeUndefined();
    expect(third.find((o) => o.id === second[3].id)?.tag).toBe("Coin");
    const restored = startingObjects(boxes);
    expect(restored[0].x).toBe(0);
  });
});

describe("Objects view", () => {
  it("shows stopped and running values, retains a live focused row, and restores the Level on Stop", () => {
    const list = document.createElement("ul"), details = document.createElement("div");
    list.tabIndex = -1;
    document.body.append(list, details);
    try {
      const view = objectInspector(list, details);
      const boxes = [
        { tag: "Player", x: 0, y: 0, w: 32, h: 32, color: "orange", script: "Player" },
        { tag: "Ground", x: 0, y: -10, w: 50, h: 10, color: "green" },
        { tag: "Ground", x: 50, y: -10, w: 50, h: 10, color: "green" },
      ];
      const stopped = startingObjects(boxes);
      view.setObjects(stopped, true);
      expect([...list.children].every((item) => item.tagName === "LI")).toBe(true);
      expect(list.querySelectorAll("button")).toHaveLength(3);
      expect(details.textContent).toContain("Player.ts");
      const firstButton = list.querySelector("button")!;
      firstButton.focus();
      firstButton.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(document.activeElement).toBe(list.querySelectorAll("button")[1]);
      expect(details.textContent).toContain("Ground");
      const running = stopped.map((object, i) => ({ ...object, id: `run:${i + 1}` }));
      view.setObjects(running, true);
      const player = list.querySelector("button")!;
      player.focus();
      view.setObjects([{ ...running[0], x: 12 }, ...running.slice(1), { ...running[1], id: "run:4", tag: "Coin" }]);
      expect(list.querySelector("button")).toBe(player);
      expect(document.activeElement).toBe(player);
      expect(details.textContent).toContain("12");
      expect(list.querySelectorAll("button")).toHaveLength(4);
      view.setObjects(running.slice(1));
      expect(details.textContent).toContain("no longer exists");
      expect(document.activeElement).toBe(list.querySelector("button"));
      view.setObjects(stopped, true);
      expect(details.textContent).toContain("Player.ts");
      expect(details.textContent).toContain("0");
      view.setObjects([], true);
      expect(details.textContent).toContain("no objects yet");
      expect(document.activeElement).toBe(list);
    } finally {
      list.remove();
      details.remove();
    }
  });
});
