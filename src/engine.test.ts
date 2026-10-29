import ts from "typescript";
import { describe, expect, it } from "vitest";
import api from "./engine-api.d.ts?raw";
import { course } from "./lessons/course";
import { Camera, Destroy, findScript, GameObject, Input, Instantiate, keyEvent, MonoBehaviour, nextFrame, releaseAllKeys, scriptSource, startGame, toScreen, Vector2 } from "./engine";

describe("Vector2", () => {
  it("adds and scales into new vectors", () => {
    const a = new Vector2(1, 2);
    expect(a.Add(new Vector2(3, 4))).toEqual(new Vector2(4, 6));
    expect(a.Scale(3)).toEqual(new Vector2(3, 6));
    expect(a).toEqual(new Vector2(1, 2));
  });
});

describe("Input", () => {
  it("reports down for one frame, held while pressed, up for one frame", () => {
    keyEvent("Space", true);
    nextFrame();
    expect([Input.GetKeyDown("Space"), Input.GetKey("Space"), Input.GetKeyUp("Space")]).toEqual([true, true, false]);
    keyEvent("Space", true); // OS key repeat
    nextFrame();
    expect([Input.GetKeyDown("Space"), Input.GetKey("Space")]).toEqual([false, true]);
    keyEvent("Space", false);
    nextFrame();
    expect([Input.GetKey("Space"), Input.GetKeyUp("Space")]).toEqual([false, true]);
    nextFrame();
    expect(Input.GetKeyUp("Space")).toBe(false);
  });
  it("releaseAllKeys lets go of every held key, so nothing stays stuck after a pause", () => {
    keyEvent("ArrowRight", true);
    keyEvent("Space", true);
    nextFrame();
    releaseAllKeys();
    nextFrame();
    expect([Input.GetKey("ArrowRight"), Input.GetKey("Space")]).toEqual([false, false]);
    expect([Input.GetKeyUp("ArrowRight"), Input.GetKeyUp("Space")]).toEqual([true, true]);
  });
});

describe("Instantiate, Destroy and FindGameObjectsWithTag", () => {
  const bullet = { tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" };
  const log: string[] = [];
  class Bullet extends MonoBehaviour {
    Start() { log.push("start"); }
    Update() {
      log.push("update");
      this.transform.position = this.transform.position.Add(new Vector2(10, 0));
      if (this.transform.position.x >= 20) Destroy(this.gameObject);
    }
  }
  class Player extends MonoBehaviour {
    Update() { if (Input.GetKeyDown("Space")) Instantiate(bullet, this.transform.position); }
  }
  const level = [{ tag: "Player", x: 0, y: 5, w: 32, h: 32, color: "orange", script: "Player" }];
  const bullets = () => GameObject.FindGameObjectsWithTag("Bullet");

  it("spawns a scripted object that starts next frame, and removes it at the end of the frame it is destroyed", () => {
    log.length = 0;
    const game = startGame(level, { Player, Bullet });
    keyEvent("Space", true);
    game.step();
    keyEvent("Space", false);
    expect(bullets()).toHaveLength(1);
    expect(bullets()[0].transform.position).toEqual(new Vector2(0, 5));
    expect(log).toEqual([]);
    game.step();
    expect(log).toEqual(["start", "update"]);
    game.step();
    expect(bullets()).toHaveLength(0);
    expect(game.objects.map((o) => o.tag)).toEqual(["Player"]);
    game.step();
    expect(log).toEqual(["start", "update", "update"]);
  });
  it("finds only objects with the tag, Level ones too", () => {
    startGame([...level, { tag: "Enemy", x: 0, y: 0, w: 1, h: 1, color: "red" }, { tag: "Enemy", x: 5, y: 0, w: 1, h: 1, color: "red" }], { Player, Bullet });
    expect(GameObject.FindGameObjectsWithTag("Enemy").map((o) => o.transform.position.x)).toEqual([0, 5]);
    expect(GameObject.FindGameObjectsWithTag("Coin")).toEqual([]);
  });
  it("names a missing Script", () => {
    startGame([], {});
    expect(() => Instantiate(bullet, new Vector2(0, 0))).toThrow("There is no Script named Bullet");
  });
});

describe("Camera", () => {
  const box = { x: 0, y: 0, w: 40, h: 40 };
  it("by default shows the 960×540 Level as is, flipping y so up is up", () => {
    startGame([], {});
    expect(toScreen(Camera.main, box, 960, 540)).toEqual({ x: 0, y: 500, w: 40, h: 40 });
    expect(toScreen(Camera.main, { ...box, y: 500 }, 960, 540)).toEqual({ x: 0, y: 0, w: 40, h: 40 });
  });
  it("moving the camera right and up moves the world left and down on screen", () => {
    startGame([], {}, { x: 580, y: 320, size: 270 });
    expect(toScreen(Camera.main, box, 960, 540)).toEqual({ x: -100, y: 550, w: 40, h: 40 });
  });
  it("a smaller orthographicSize zooms in around the view centre", () => {
    startGame([], {});
    Camera.main.orthographicSize = 135;
    expect(toScreen(Camera.main, { x: 480, y: 270, w: 40, h: 40 }, 960, 540)).toEqual({ x: 480, y: 190, w: 80, h: 80 });
  });
  it("startGame resets the camera a Script moved", () => {
    Camera.main.transform.position = new Vector2(0, 0);
    startGame([], {});
    expect([Camera.main.transform.position, Camera.main.orthographicSize]).toEqual([new Vector2(480, 270), 270]);
  });
});

describe("facing", () => {
  it("flips after moving left and stays flipped while still", () => {
    let dx = 0;
    class Player extends MonoBehaviour {
      Update() { this.transform.position = this.transform.position.Add(new Vector2(dx, 0)); }
    }
    const game = startGame([{ tag: "Player", x: 50, y: 0, w: 32, h: 48, color: "orange", script: "Player" }], { Player });
    const player = game.objects[0];
    expect(player.facing).toBe(1);
    dx = -5;
    game.step();
    expect(player.facing).toBe(-1);
    dx = 0;
    game.step();
    game.step();
    expect(player.facing).toBe(-1);
    dx = 3;
    game.step();
    expect(player.facing).toBe(1);
  });
});

describe("findScript", () => {
  class Player extends MonoBehaviour {}
  it("returns the class the student defined", () => {
    expect(findScript({ __script: Player }, "Player")).toBe(Player);
  });
  it("explains a missing or wrong class", () => {
    expect(() => findScript({}, "Player")).toThrow("Player.ts must define class Player extends MonoBehaviour");
    expect(() => findScript({ __script: class {} }, "Player")).toThrow("extends MonoBehaviour");
  });
  it("scriptSource exports the class by name, exported or not, without moving lines", () => {
    const src = scriptSource("class Player {}", "Player");
    expect(src.split("\n")[0]).toBe("class Player {}");
    expect(new Function(src.replace("export const", "return"))()).toBeTypeOf("function");
    expect(new Function(scriptSource("", "Player").replace("export const", "return"))()).toBeUndefined();
  });
});

describe("student typings", () => {
  const errors = (code: string) => {
    const files: Record<string, string> = { "/api.d.ts": api, "/Player.ts": code };
    const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, lib: ["lib.es2022.d.ts"], types: [] };
    const host = ts.createCompilerHost(options);
    const read = host.getSourceFile;
    host.getSourceFile = (name, lang) =>
      name in files ? ts.createSourceFile(name, files[name], lang) : read.call(host, name, lang);
    return ts.getPreEmitDiagnostics(ts.createProgram(Object.keys(files), options, host)).map((d) =>
      ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  };

  it("accepts the move-right example", () => {
    expect(errors(`class Player extends MonoBehaviour {
      Start() { if (Input.GetKey(KeyCode.Space)) this.transform.position = new Vector2(0, 0).Scale(2); }
      Update() { this.transform.position = this.transform.position.Add(new Vector2(100 * Time.deltaTime, 0)); }
    }`)).toEqual([]);
  });
  it("accepts spawning, finding and destroying", () => {
    expect(errors(`class Player extends MonoBehaviour {
      Update() {
        Instantiate({ tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" }, this.transform.position);
        for (const e of GameObject.FindGameObjectsWithTag("Enemy")) if (e.tag === "Enemy") Destroy(e);
        Destroy(this.gameObject);
      }
    }`)).toEqual([]);
  });
  it.each(course.map((l) => [l.title, l.scripts] as const))("accepts the Reference code of Lesson %s", (_, scripts) => {
    for (const { reference } of Object.values(scripts)) expect(errors(reference)).toEqual([]);
  });
  it("rejects writing to position.x", () => {
    expect(errors(`class Player extends MonoBehaviour { Update() { this.transform.position.x += 5; } }`).join())
      .toContain("read-only");
  });
  it("has a doc comment on every member", () => {
    const undocumented: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isClassElement(node) || ts.isEnumMember(node) || ts.isClassDeclaration(node) || ts.isEnumDeclaration(node)) {
        if (!ts.getJSDocCommentsAndTags(node).length) undocumented.push(node.name!.getText());
      }
      ts.forEachChild(node, visit);
    };
    visit(ts.createSourceFile("api.d.ts", api, ts.ScriptTarget.ES2022, true));
    expect(undocumented).toEqual([]);
  });
});
