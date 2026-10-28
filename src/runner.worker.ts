// One worker per Run: owns the game loop, the canvas and the student's code.
import { errorLine } from "./run-utils";

const keys = new Set<string>();

function report(err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err));
  postMessage({ type: "error", message: e.message, ...errorLine(e.stack) });
}

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === "key") {
    if (e.data.down) keys.add(e.data.key);
    else keys.delete(e.data.key);
    return;
  }

  const canvas: OffscreenCanvas = e.data.canvas;
  const ctx = canvas.getContext("2d")!;
  // shortcut: bare `ctx` / `keys` globals stand in for the Unity-style API, replace once the game API (ticket 002) lands.
  Object.assign(globalThis, { ctx, keys });

  const url = URL.createObjectURL(new Blob([e.data.js], { type: "text/javascript" }));
  let mod: { update?: (dt: number) => void };
  try {
    mod = await import(/* @vite-ignore */ url);
  } catch (err) {
    return report(err);
  }

  const frame = () => {
    postMessage({ type: "tick" });
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mod.update?.(1 / 60);
    } catch (err) {
      return report(err); // stop the loop: the game pauses on the error
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
