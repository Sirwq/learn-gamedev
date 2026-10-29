import ts from "typescript";
import { describe, expect, it } from "vitest";
import api from "./engine-api.d.ts?raw";
import { anchor, docLink, docPages } from "./docs";
import { aiNote } from "./lessons/ai-note";

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

  it("has one page per class plus the C# page, each with the AI note", () => {
    expect(pages.map((p) => p.title)).toEqual(
      ["Vector2", "Transform", "MonoBehaviour", "GameObject", "Time", "Input", "KeyCode", "Debug", "Camera", "TypeScript vs Unity C#"],
    );
    for (const p of pages) expect(p.markdown).toContain(aiNote);
    expect(pages.find((p) => p.title === "GameObject")!.ids).toEqual(expect.arrayContaining(["Instantiate", "Destroy", "Prefab"]));
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
