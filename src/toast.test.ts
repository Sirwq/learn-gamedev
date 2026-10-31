// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { achievementToast } from "./toast";

describe("Achievement notices", () => {
  beforeEach(() => { document.body.innerHTML = '<div id="toasts" role="status"></div>'; });

  it("shows the full message and gives simultaneous unlocks separate turns", () => {
    const first = achievementToast("🏆", "Achievement unlocked", "First steps", "Move the player for the first time");
    const second = achievementToast("🦘", "Achievement unlocked", "First jump", "Jump for the first time");
    expect(first.textContent).toContain("Move the player for the first time");
    expect(second.hidden).toBe(true);
    first.dispatchEvent(new Event("animationend"));
    expect(first.isConnected).toBe(false);
    expect(second.hidden).toBe(false);
    second.dispatchEvent(new Event("animationend"));
    expect(document.querySelectorAll("#toasts > .achievement")).toHaveLength(0);
  });
});
