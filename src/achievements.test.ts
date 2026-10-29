import { describe, expect, it, vi } from "vitest";
import { achievementChecker, achievements, loadEarned, saveEarned, stateOf } from "./achievements";
import { type Box, keyEvent, KeyCode, keysDown, releaseAllKeys, startGame, worldView, type World } from "./engine";
import { loadScript, memoryStore } from "./test-helpers";

const at = (x: number): World => [{ tag: "Player", x, y: 40, w: 32, h: 32, color: "" }];

describe("achievements", () => {
  it("is a tree of 21 with one root and no cycles", () => {
    expect(achievements).toHaveLength(21);
    expect(new Set(achievements.map((a) => a.id)).size).toBe(21);
    expect(achievements.filter((a) => !a.after)).toHaveLength(1);
    const byId = new Map(achievements.map((a) => [a.id, a]));
    for (const a of achievements) {
      const path = new Set<string>();
      for (let n: typeof a | undefined = a; n; n = n.after ? byId.get(n.after) : undefined) {
        expect(path.has(n.id)).toBe(false);
        path.add(n.id);
        if (n.after) expect(byId.has(n.after)).toBe(true);
      }
    }
  });

  it("checks only Achievements whose `after` is earned", () => {
    const root = { id: "a", after: null, test: vi.fn(() => false) };
    const next = { id: "b", after: "a", test: vi.fn(() => true) };
    const list = [root, next] as unknown as typeof achievements;
    const check = achievementChecker(at(0), new Set(), list);
    expect(check(at(0))).toEqual([]);
    expect(root.test).toHaveBeenCalled();
    expect(next.test).not.toHaveBeenCalled();

    const earned = new Set(["a"]);
    expect(achievementChecker(at(0), earned, list)(at(0))).toEqual(["b"]);
    expect(root.test).toHaveBeenCalledTimes(1); // earned ones aren't checked again
    expect(earned.has("b")).toBe(true);
  });

  it("earns First steps when the Player moves, and Both ways only after left and right in one Run", () => {
    const earned = new Set<string>();
    const check = achievementChecker(at(100), earned);
    expect(check(at(100))).toEqual([]);
    expect(check(at(110))).toEqual(["steps"]);
    expect(check(at(105))).toEqual([]); // Both ways was hidden on the frame that went right
    expect(check(at(115))).toEqual(["both"]);
  });

  it("shows earned, locked and hidden tiles", () => {
    const earned = new Set(["steps"]);
    const byId = (id: string) => achievements.find((a) => a.id === id)!;
    expect(stateOf(byId("steps"), earned)).toBe("earned");
    expect(stateOf(byId("fall"), earned)).toBe("locked");
    expect(stateOf(byId("jump"), earned)).toBe("hidden");
  });

  it("saves earned Achievements", () => {
    const store = memoryStore();
    saveEarned("steps", store);
    expect(loadEarned(store)).toEqual(new Set(["steps"]));
  });
});

// A small reference Player: walks, falls and jumps off the ground and Walls; each move below adds one Extra.
const playerScript = (extra: { fields?: string; update?: string }) => `
class Player extends MonoBehaviour {
  velocityY = 0;
  velocityX = 0;
  onGround = false;
  ${extra.fields ?? ""}
  Update() {
    let vx = this.velocityX;
    if (Input.GetKey(KeyCode.RightArrow)) vx = vx + 400;
    if (Input.GetKey(KeyCode.LeftArrow)) vx = vx - 400;
    ${extra.update ?? ""}
    if (Input.GetKeyDown(KeyCode.Space) && this.onGround) {
      this.velocityY = 600;
      this.onGround = false;
    }
    this.velocityY = this.velocityY - 1500 * Time.deltaTime;
    let p = this.transform.position.Add(new Vector2(vx * Time.deltaTime, this.velocityY * Time.deltaTime));
    if (p.y <= 40) {
      p = new Vector2(p.x, 40);
      this.velocityY = 0;
      this.velocityX = 0;
      this.onGround = true;
    }
    const walls = GameObject.FindGameObjectsWithTag("Wall");
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i].transform.position;
      if (p.x + 32 > w.x && p.x < w.x + walls[i].w && p.y < w.y + walls[i].h) p = new Vector2(vx > 0 ? w.x - 32 : w.x + walls[i].w, p.y);
    }
    this.transform.position = p;
  }
}`;

const moves = {
  doublejump: { fields: "jumps = 0;", update: "if (this.onGround) this.jumps = 0;\n if (Input.GetKeyDown(KeyCode.Space) && !this.onGround && this.jumps < 1) { this.velocityY = 600; this.jumps = 1; }" },
  walljump: {
    update: `const sides = GameObject.FindGameObjectsWithTag("Wall");
    for (let i = 0; i < sides.length; i++) {
      if (Input.GetKeyDown(KeyCode.Space) && !this.onGround && this.transform.position.x + 32 === sides[i].transform.position.x) {
        this.velocityY = 600;
        this.velocityX = -400;
      }
    }`,
  },
  dash: { fields: "dashing = 0;", update: "if (Input.GetKeyDown(KeyCode.D)) this.dashing = 12;\n if (this.dashing > 0) { this.dashing = this.dashing - 1; vx = 1200; }" },
};

const level: Box[] = [
  { tag: "Player", x: 100, y: 40, w: 32, h: 32, color: "", script: "Player" },
  { tag: "Ground", x: -500, y: 0, w: 3000, h: 40, color: "" },
  { tag: "Wall", x: 250, y: 40, w: 40, h: 400, color: "" },
];
const dashLevel = level.slice(0, 2);
const { Space, RightArrow: Right, D } = KeyCode;

/** Achievements met in 120 frames with `keys` held on each frame, every one checked as if unlocked. */
function play(update: { fields?: string; update?: string }, keys: (frame: number) => string[], boxes = level) {
  const game = startGame(boxes, { Player: loadScript(playerScript(update), "Player") });
  const check = achievementChecker(worldView(game.objects), new Set(), achievements.map((a) => ({ ...a, after: null })));
  const met = new Set<string>();
  releaseAllKeys();
  let held: string[] = [];
  for (let frame = 1; frame <= 120; frame++) {
    const now = keys(frame);
    for (const k of held) if (!now.includes(k)) keyEvent(k, false);
    for (const k of now) keyEvent(k, true);
    held = now;
    game.step();
    for (const id of check(worldView(game.objects), { keysDown: keysDown() })) met.add(id);
  }
  return met;
}

describe("Mechanic Achievements", () => {
  const jumpTwice = (f: number) => (f === 5 || f === 20 ? [Space] : []);
  // Jump, run into the Wall while rising, press Space against it.
  const offTheWall = (f: number) => (f === 5 ? [Space, Right] : f === 25 ? [Space] : f < 25 ? [Right] : []);
  const dashRight = (f: number) => (f === 30 ? [Right, D] : [Right]);

  it("earns Double jump only with a double jump", () => {
    expect(play(moves.doublejump, jumpTwice)).toContain("doublejump");
    expect(play({}, jumpTwice)).not.toContain("doublejump");
  });

  it("earns Wall jump only with a wall jump", () => {
    expect(play(moves.walljump, offTheWall)).toContain("walljump");
    expect(play({}, offTheWall)).not.toContain("walljump");
    expect(play(moves.doublejump, offTheWall)).not.toContain("walljump"); // up the Wall, not off it
  });

  it("earns Dash only with a dash, not with a higher speed", () => {
    expect(play(moves.dash, dashRight, dashLevel)).toContain("dash");
    expect(play({}, dashRight, dashLevel)).not.toContain("dash");
    expect(play({ update: "if (Input.GetKey(KeyCode.RightArrow)) vx = 1200;" }, dashRight, dashLevel)).not.toContain("dash");
  });
});
