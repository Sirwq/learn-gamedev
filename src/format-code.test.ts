import { describe, expect, it, vi } from "vitest";
import { formatCode } from "./format-code";

describe("Format Code", () => {
  const setup = () => {
    const model = { uri: "file:///Player.ts", version: 1, getVersionId() { return this.version; } };
    const run = vi.fn(async () => {});
    const focus = vi.fn();
    const dom = { hidden: false };
    const editor = { getModel: () => model, getDomNode: () => dom, getAction: () => ({ run }), focus };
    const diagnostics = vi.fn(async () => [] as { category: number }[]);
    return { model, dom, run, focus, editor, diagnostics };
  };

  it("formats the active Script with Monaco's one undoable action and returns focus", async () => {
    const { editor, diagnostics, run, focus } = setup();
    expect(await formatCode(editor, diagnostics)).toBe("formatted");
    expect(diagnostics).toHaveBeenCalledWith("file:///Player.ts");
    expect(run).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });

  it("leaves incomplete code intact", async () => {
    const { editor, diagnostics, run } = setup();
    diagnostics.mockResolvedValue([{ category: 1 }]);
    expect(await formatCode(editor, diagnostics)).toBe("invalid");
    expect(run).not.toHaveBeenCalled();
  });

  it("does not format another Script or stale edits after an async syntax check", async () => {
    const { editor, diagnostics, run, model } = setup();
    diagnostics.mockImplementation(async () => { model.version++; return []; });
    expect(await formatCode(editor, diagnostics)).toBe("changed");
    expect(run).not.toHaveBeenCalled();
  });

  it("does not format when the student switches Scripts during the syntax check", async () => {
    const { editor, diagnostics, run } = setup();
    let active = editor.getModel();
    editor.getModel = () => active;
    diagnostics.mockImplementation(async () => { active = { uri: "file:///Bullet.ts", version: 1, getVersionId() { return this.version; } }; return []; });
    expect(await formatCode(editor, diagnostics)).toBe("changed");
    expect(run).not.toHaveBeenCalled();
  });

  it("does not format when the student opens Docs during the syntax check", async () => {
    const { editor, diagnostics, run, dom } = setup();
    diagnostics.mockImplementation(async () => { dom.hidden = true; return []; });
    expect(await formatCode(editor, diagnostics)).toBe("changed");
    expect(run).not.toHaveBeenCalled();
  });
});
