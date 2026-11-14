import ts from "typescript";
import { describe, expect, it } from "vitest";
import api from "./engine-api.d.ts?raw";
import { anchor, docLink, docPageAvailable, docPages } from "./docs";
import { sandboxUnlocked } from "./sandbox";
import { course } from "./lessons/course";
import { markPassed } from "./check";
import { memoryStore } from "./test-helpers";

const pages = docPages(api);

describe("Docs", () => {
  it("has a page for every exported member, with its doc comment text, read independently by the TypeScript parser", () => {
    const missing: string[] = [];
    const check = (node: ts.Node, id: string) => {
      const doc = ts.getJSDocCommentsAndTags(node)[0];
      const text = doc && ts.isJSDoc(doc) ? ts.getTextOfJSDocComment(doc.comment)?.replace(/\s+/g, " ") : undefined;
      const page = pages.find((p) => p.ids.includes(id));
      if (!text || !page?.markdown.includes(`id="${anchor(id)}"`) || !page.markdown.includes(text)) missing.push(id);
    };
    for (const node of ts.createSourceFile("api.d.ts", api, ts.ScriptTarget.ES2022, true).statements) {
      const name = (node as ts.DeclarationStatement).name!.getText();
      check(node, name);
      if (ts.isClassDeclaration(node) || ts.isEnumDeclaration(node))
        for (const m of node.members) check(m, `${name}.${m.name?.getText() ?? "constructor"}`);
    }
    expect(missing).toEqual([]);
  });

  it("has one page per class plus the C# page", () => {
    expect(pages.map((p) => p.title)).toEqual(
      ["Vector2", "Transform", "MonoBehaviour", "AudioSource", "Collider2D", "GameObject", "Time", "Input", "KeyCode", "Debug", "Camera", "GUI", "GUISkin", "GUIStyle", "Rect", "Color", "TextAnchor", "TypeScript vs Unity C#"],
    );
    expect(pages.find((p) => p.title === "GameObject")!.ids).toEqual(expect.arrayContaining(["Instantiate", "Destroy", "Prefab"]));
  });

  it("shows the hand-written Sandbox guide only after unlock, with class links", () => {
    const store = memoryStore();
    expect(docPageAvailable("Sandbox", sandboxUnlocked(course, store))).toBe(false);
    expect(docPageAvailable("GameObject", sandboxUnlocked(course, store))).toBe(true);
    markPassed(course[14].title, store);
    expect(docPageAvailable("Sandbox", sandboxUnlocked(course, store))).toBe(true);
    expect(docPages(api, false).some((p) => p.title === "Sandbox")).toBe(false);
    const guide = docPages(api, true).find((p) => p.title === "Sandbox")!;
    expect(guide.markdown).toContain("Piskel");
    expect(guide.markdown).toContain("Aseprite");
    for (const id of ["GameObject", "AudioSource", "GUI"])
      expect(guide.markdown).toContain(`#${anchor(id)}`);
    const ids = new Set(docPages(api, true).flatMap((page) => page.ids));
    for (const [, id] of guide.markdown.matchAll(/#doc-([A-Za-z.]+)/g)) expect(ids.has(id)).toBe(true);
    for (const clip of ["Jump", "Coin", "Hit", "Hurt", "Shoot", "Explosion", "Powerup", "Win", "Lose", "Click"])
      expect(guide.markdown).toContain(clip);
    expect(guide.markdown).toContain("y goes down");
    expect(guide.markdown).toContain("Export it and send the file");
  });

  it("lists every Differs from Unity C# note on the C# page", () => {
    const cs = pages.at(-1)!.markdown;
    expect(cs).toContain(`[Vector2.Add](#${anchor("Vector2.Add")})`);
    expect(cs).toContain(`[Time.deltaTime](#${anchor("Time.deltaTime")})`);
    expect(cs).toContain(`[MonoBehaviour.transform](#${anchor("MonoBehaviour.transform")})`);
  });

  it("links API names in Explanations to their member", () => {
    expect(docLink(pages, "Update()")).toBe("MonoBehaviour.Update");
    expect(docLink(pages, "Time.deltaTime")).toBe("Time.deltaTime");
    expect(docLink(pages, "Input.GetKey")).toBe("Input.GetKey");
    expect(docLink(pages, "GameObject.FindGameObjectsWithTag(\"Platform\")[0]")).toBe("GameObject.FindGameObjectsWithTag");
    expect(docLink(pages, "Vector2")).toBe("Vector2");
    expect(docLink(pages, "transform")).toBeUndefined(); // ambiguous: MonoBehaviour, GameObject and Camera all have one
    expect(docLink(pages, "speed")).toBeUndefined();
    expect(docLink(pages, "if (x < 0)")).toBeUndefined();
  });
});
