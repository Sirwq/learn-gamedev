import { describe, expect, it } from "vitest";
import { memoryStore } from "./test-helpers";
import { loadMuted, saveMuted } from "./sound";

describe("mute", () => {
  it("is off by default and saved", () => {
    const store = memoryStore();
    expect(loadMuted(store)).toBe(false);
    saveMuted(store, true);
    expect(loadMuted(store)).toBe(true);
    saveMuted(store, false);
    expect(loadMuted(store)).toBe(false);
  });
});
