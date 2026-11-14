import { expect, it, vi } from "vitest";
import { saveState } from "./save-state";

it("keeps unsaved warnings through failure and clears them only after the newest save", async () => {
  const show = vi.fn();
  const state = saveState(show);
  let finish!: () => void;
  const first = state.track(new Promise<void>((resolve) => { finish = resolve; }));
  expect(await state.track(Promise.reject(new Error("disk full")))).toBe(false);
  finish();
  await first;
  expect(state.dirty).toBe(true);
  expect(show).toHaveBeenLastCalledWith("error");
  expect(await state.track(Promise.resolve())).toBe(true);
  expect(state.dirty).toBe(false);
  expect(show).toHaveBeenLastCalledWith("saved");
});
