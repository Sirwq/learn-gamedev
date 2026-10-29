// One worker per Run: owns the game loop, the canvas and the student's code.
import { animates, errorLine } from "./run-utils";
import { api, type Box, Camera, findScript, keyEvent, logs, type MonoBehaviour, releaseAllKeys, scriptSource, startGame, worldView } from "./engine";
import { drawWorld, loadImages } from "./sprites";
import { checker } from "./check";
import { achievementChecker } from "./achievements";
import { course } from "./lessons/course";
import type { FromWorker, ToWorker } from "./runner-protocol";

const scriptOf: Record<string, string> = {}; // blob URL -> Script name
let paused = false;
let pausedFrame: (() => void) | undefined; // the frame a pause stopped, run again on resume
const images = loadImages(); // one load per worker, i.e. per Run
const send = (message: FromWorker) => postMessage(message);

function flushLogs() {
  if (logs.length) send({ type: "logs", lines: logs.splice(0) });
}

function report(err: unknown) {
  flushLogs(); // lines logged before the error show above it
  const e = err instanceof Error ? err : new Error(String(err));
  const at = errorLine(e.stack);
  send({ type: "error", message: e.message, script: at && scriptOf[at.url], line: at?.line, col: at?.col });
}

self.onmessage = async ({ data }: MessageEvent<ToWorker>) => {
  if (data.type === "key") return keyEvent(data.code, data.down);
  if (data.type === "pause") {
    paused = true;
    releaseAllKeys();
    return send({ type: "paused", paused: true }); // a worker stuck in a loop never answers, so the watchdog still fires
  }
  if (data.type === "resume") {
    paused = false;
    if (pausedFrame) requestAnimationFrame(pausedFrame);
    pausedFrame = undefined;
    return send({ type: "paused", paused: false }); // acks arrive in order, so a quick blur+focus can't leave the page thinking it's paused
  }

  const canvas = data.canvas;
  // Goals and Lose events are functions, so the worker loads a Lesson itself; a Sandbox Project sends its Level and has neither.
  const lesson = "level" in data ? { level: data.level, goals: [], lose: [] } : course[data.lesson];
  const level: Box[] = lesson.level.boxes;
  const scripts = data.scripts;
  const ctx = canvas.getContext("2d")!;
  Object.assign(globalThis, api);

  let game: ReturnType<typeof startGame>;
  const sprites = await images;
  try {
    const classes: Record<string, new () => MonoBehaviour> = {};
    for (const name in scripts) { // every Script, since Instantiate may attach one no box uses
      const url = URL.createObjectURL(new Blob([scriptSource(scripts[name], name)], { type: "text/javascript" }));
      scriptOf[url] = name;
      classes[name] = findScript(await import(/* @vite-ignore */ url), name);
    }
    Object.assign(globalThis, classes); // the editor type-checks Scripts against each other, so they see each other here too
    game = startGame(level, classes, lesson.level.camera);
  } catch (err) {
    return report(err);
  }

  const check = checker(lesson);
  const achieve = achievementChecker(level, new Set(data.earned));
  let last = "";
  let frames = 0; // drawn so far: the animation clock, which stops while paused
  const animate = animates(data);
  const frame = () => {
    if (paused) return void (pausedFrame = frame);
    send({ type: "tick" });
    let result, earned;
    try {
      game.step();
      const world = worldView(game.objects);
      result = check(world);
      earned = achieve(world, logs.length > 0); // also on the frame the game stops
    } catch (err) {
      return report(err); // stop the loop: the game pauses on the error
    }
    flushLogs();
    if (earned.length) send({ type: "achievements", ids: earned });
    const json = JSON.stringify(result);
    if (json !== last) send({ type: "check", ...result });
    last = json;
    drawWorld(ctx, sprites, Camera.main, game.objects, animate ? frames++ / 60 : undefined);
    if (!result.lost && !result.passed) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
