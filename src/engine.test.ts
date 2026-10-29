import ts from "typescript";
import { describe, expect, it } from "vitest";
import api from "./engine-api.d.ts?raw";
import { findScript, flipY, Input, keyEvent, MonoBehaviour, nextFrame, scriptSource, Vector2 } from "./engine";

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
});

describe("flipY", () => {
  it("turns a bottom-left y-up box into a canvas top-left y", () => {
    expect(flipY(0, 40, 540)).toBe(500);
    expect(flipY(500, 40, 540)).toBe(0);
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
