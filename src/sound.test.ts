import { describe, expect, it, vi } from "vitest";
import { memoryStore } from "./test-helpers";
import { loadMuted, playAchievementCue, saveMuted } from "./sound";

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

it("plays a quiet unlock cue once when an audio context is available", () => {
  // The production context is unlocked by Run; this checks the cue's own routing and level.
  const oscillator = { type: "sine", frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
  const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() };
  const context = { state: "running", currentTime: 5, destination: {}, createOscillator: () => oscillator, createGain: () => gain };
  playAchievementCue(context as unknown as AudioContext);
  expect(oscillator.start).toHaveBeenCalledOnce();
  expect(oscillator.stop).toHaveBeenCalledOnce();
  expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.035, 5);
  context.state = "suspended";
  playAchievementCue(context as unknown as AudioContext);
  expect(oscillator.start).toHaveBeenCalledOnce();
});
