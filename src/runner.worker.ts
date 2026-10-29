// One worker per Run: owns the game loop, the canvas and the student's code.
import { errorLine } from "./run-utils";
import { type Box, findScript, flipY, Input, keyEvent, KeyCode, MonoBehaviour, nextFrame, scriptSource, Time, Transform, Vector2 } from "./engine";

function report(err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err));
  postMessage({ type: "error", message: e.message, ...errorLine(e.stack) });
}

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === "key") return keyEvent(e.data.code, e.data.down);

  const canvas: OffscreenCanvas = e.data.canvas;
  const level: Box[] = e.data.level;
  const scripts: Record<string, string> = e.data.scripts;
  const ctx = canvas.getContext("2d")!;
  Object.assign(globalThis, { MonoBehaviour, Vector2, Time, Input, KeyCode });

  const objects = level.map((box) => ({ ...box, transform: new Transform(new Vector2(box.x, box.y)) }));
  const behaviours: MonoBehaviour[] = [];
  try {
    for (const obj of objects) {
      if (!obj.script) continue;
      const url = URL.createObjectURL(new Blob([scriptSource(scripts[obj.script], obj.script)], { type: "text/javascript" }));
      const b = new (findScript(await import(/* @vite-ignore */ url), obj.script))();
      b.transform = obj.transform;
      behaviours.push(b);
    }
    for (const b of behaviours) b.Start?.();
  } catch (err) {
    return report(err);
  }

  const frame = () => {
    postMessage({ type: "tick" });
    nextFrame();
    try {
      for (const b of behaviours) b.Update?.();
    } catch (err) {
      return report(err); // stop the loop: the game pauses on the error
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const { transform: { position }, w, h, color } of objects) {
      ctx.fillStyle = color;
      ctx.fillRect(position.x, flipY(position.y, h, canvas.height), w, h);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
