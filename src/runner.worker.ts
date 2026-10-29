// One worker per Run: owns the game loop, the canvas and the student's code.
import { errorLine } from "./run-utils";
import { api, type Box, findScript, flipY, keyEvent, type MonoBehaviour, scriptSource, startGame, worldView } from "./engine";
import { checker } from "./check";
import { course } from "./lessons/course";

function report(err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err));
  postMessage({ type: "error", message: e.message, ...errorLine(e.stack) });
}

self.onmessage = async (e: MessageEvent) => {
  if (e.data.type === "key") return keyEvent(e.data.code, e.data.down);

  const canvas: OffscreenCanvas = e.data.canvas;
  const lesson = course[e.data.lesson]; // Goals and Lose events are functions, so the worker loads them itself
  const level: Box[] = lesson.level.boxes;
  const scripts: Record<string, string> = e.data.scripts;
  const ctx = canvas.getContext("2d")!;
  Object.assign(globalThis, api);

  let game: ReturnType<typeof startGame>;
  try {
    const classes: Record<string, new () => MonoBehaviour> = {};
    for (const name of new Set(level.flatMap((box) => box.script ?? []))) {
      const url = URL.createObjectURL(new Blob([scriptSource(scripts[name], name)], { type: "text/javascript" }));
      classes[name] = findScript(await import(/* @vite-ignore */ url), name);
    }
    game = startGame(level, classes);
  } catch (err) {
    return report(err);
  }

  const check = checker(lesson);
  let last = "";
  const frame = () => {
    postMessage({ type: "tick" });
    let result;
    try {
      game.step();
      result = check(worldView(game.objects));
    } catch (err) {
      return report(err); // stop the loop: the game pauses on the error
    }
    const json = JSON.stringify(result);
    if (json !== last) postMessage({ type: "check", ...result });
    last = json;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const { transform: { position }, w, h, color } of game.objects) {
      ctx.fillStyle = color;
      ctx.fillRect(position.x, flipY(position.y, h, canvas.height), w, h);
    }
    if (!result.lost && !result.passed) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
