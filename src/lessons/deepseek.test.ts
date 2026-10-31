import { describe, expect, it, vi } from "vitest";
import { DEEPSEEK_CHAT, MAX_PREFILL_URL, askDeepSeek, deepSeekHandoff, encodePrompt } from "./deepseek";

const prompt = "Tutor rules:\n\n## My code: Player.ts\n\n```ts\nif (a < b) console.log(\"hi & bye\");\n```\n\nMy question: ";

describe("deepSeekHandoff", () => {
  it("puts the full prompt in q and never adds autosend", () => {
    const handoff = deepSeekHandoff(prompt);
    expect(handoff.kind).toBe("prefill");
    const url = new URL(handoff.url);
    expect(url.origin + url.pathname).toBe(DEEPSEEK_CHAT);
    expect(url.searchParams.get("q")).toBe(prompt);
    expect(url.searchParams.has("autosend")).toBe(false);
    expect(url.searchParams.has("source")).toBe(false);
    expect(url.searchParams.has("search")).toBe(false);
    expect(url.searchParams.has("thinking")).toBe(false);
  });

  it("encodes punctuation the way DeepSeek's own links do", () => {
    expect(encodePrompt("file (a)!*'")).toBe("file%20%28a%29%21%2A%27");
    expect(deepSeekHandoff("file (a)").url).toContain("?q=file%20%28a%29");
  });

  it("keeps the full prompt just under the URL cap", () => {
    const prefix = `${DEEPSEEK_CHAT}?q=`;
    const longest = "a".repeat(MAX_PREFILL_URL - prefix.length);
    const handoff = deepSeekHandoff(longest);
    expect(handoff.kind).toBe("prefill");
    expect(handoff.url).toHaveLength(MAX_PREFILL_URL);
    expect(new URL(handoff.url).searchParams.get("q")).toBe(longest);
  });

  it("falls back to plain chat instead of truncating an oversized prompt", () => {
    const longest = "a".repeat(MAX_PREFILL_URL - `${DEEPSEEK_CHAT}?q=`.length);
    expect(deepSeekHandoff(`${longest}a`)).toEqual({ kind: "manual", url: DEEPSEEK_CHAT });
  });

  it("falls back to plain chat when a lone surrogate cannot be encoded", () => {
    expect(deepSeekHandoff("before\uD800after")).toEqual({ kind: "manual", url: DEEPSEEK_CHAT });
  });
});

describe("askDeepSeek", () => {
  const deps = () => ({
    copy: vi.fn<(text: string) => Promise<void>>(async () => {}),
    open: vi.fn<(url: string) => Window | null>(() => ({}) as Window),
    showFallback: vi.fn<(text: string) => void>(),
  });

  it("copies the full prompt before opening the unsent prefill link", async () => {
    const d = deps();
    const order: string[] = [];
    d.copy.mockImplementationOnce(async () => { order.push("copy"); });
    d.open.mockImplementationOnce(() => { order.push("open"); return {} as Window; });
    await expect(askDeepSeek({ prompt, ...d })).resolves.toBe("prefilled");
    expect(order).toEqual(["copy", "open"]);
    expect(d.copy).toHaveBeenCalledWith(prompt);
    expect(d.open).toHaveBeenCalledWith(deepSeekHandoff(prompt).url);
    expect(d.showFallback).not.toHaveBeenCalled();
  });

  it("opens plain chat and keeps the full prompt for manual paste when the URL is too long", async () => {
    const long = "x".repeat(MAX_PREFILL_URL);
    const d = deps();
    await expect(askDeepSeek({ prompt: long, ...d })).resolves.toBe("manual");
    expect(d.copy).toHaveBeenCalledWith(long);
    expect(d.open).toHaveBeenCalledWith(DEEPSEEK_CHAT);
    expect(d.showFallback).not.toHaveBeenCalled();
  });

  it("shows the full prompt when copying fails and does not open a tab", async () => {
    const d = deps();
    d.copy.mockRejectedValueOnce(new Error("clipboard denied"));
    await expect(askDeepSeek({ prompt, ...d })).resolves.toBe("copy-failed");
    expect(d.open).not.toHaveBeenCalled();
    expect(d.showFallback).toHaveBeenCalledWith(prompt);
  });

  it("shows the full prompt when the popup is blocked", async () => {
    const d = deps();
    d.open.mockReturnValueOnce(null);
    await expect(askDeepSeek({ prompt, ...d })).resolves.toBe("popup-blocked");
    expect(d.copy).toHaveBeenCalledWith(prompt);
    expect(d.showFallback).toHaveBeenCalledWith(prompt);
  });

  it("treats an opening error as a blocked popup", async () => {
    const d = deps();
    d.open.mockImplementationOnce(() => { throw new Error("blocked"); });
    await expect(askDeepSeek({ prompt, ...d })).resolves.toBe("popup-blocked");
    expect(d.showFallback).toHaveBeenCalledWith(prompt);
  });
});
