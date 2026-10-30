// One worker per Run: owns the game loop, the canvas and the student's code.
import { errorLine, v2Features } from "./run-utils";
import { api, Camera, findScript, type MonoBehaviour, scriptSource } from "./engine";
import { drawWorld, loadImages, ownSprites } from "./sprites";
import { createRun, drainRunLogs, releaseRunKeys, runInput } from "./run-frame";
import { course } from "./lessons/course";
import type { FromWorker, ToWorker } from "./runner-protocol";
import { objectSnapshots } from "./object-snapshots";

const scriptOf: Record<string, string> = {}; // blob URL -> Script name
let paused = false;
let pausedFrame: (() => void) | undefined; // the frame a pause stopped, run again on resume
const images = loadImages(); // one load per worker, i.e. per Run
const send = (message: FromWorker) => postMessage(message);
let inspectOpen = false;
let sendObjects: (() => void) | undefined;

function report(err: unknown) {
  const lines = drainRunLogs();
  if (lines.length) send({ type: "logs", lines }); // lines logged before the error show above it
  const e = err instanceof Error ? err : new Error(String(err));
  const at = errorLine(e.stack);
  send({ type: "error", message: e.message, script: at && scriptOf[at.url], line: at?.line, col: at?.col });
}

self.onmessage = async ({ data }: MessageEvent<ToWorker>) => {
  if (data.type === "key") return runInput(data.code, data.down);
  if (data.type === "inspect") {
    inspectOpen = data.open;
    if (inspectOpen) sendObjects?.();
    return;
  }
  if (data.type === "pause") {
    paused = true;
    releaseRunKeys();
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
  const scripts = data.scripts;
  const ctx = canvas.getContext("2d")!;
  Object.assign(globalThis, api);

  let run: ReturnType<typeof createRun>;
  const v2 = v2Features(data); // Lessons 1–15 don't animate, play sounds or call OnGUI
  const sprites = await images;
  const own = "level" in data ? await ownSprites(data.level.art, data.images).catch(() => ({})) : {}; // a broken image draws the default art
  try {
    const classes: Record<string, new () => MonoBehaviour> = {};
    for (const name in scripts) { // every Script, since Instantiate may attach one no box uses
      const url = URL.createObjectURL(new Blob([scriptSource(scripts[name], name)], { type: "text/javascript" }));
      scriptOf[url] = name;
      classes[name] = findScript(await import(/* @vite-ignore */ url), name);
    }
    Object.assign(globalThis, classes); // the editor type-checks Scripts against each other, so they see each other here too
    run = createRun({ level: lesson.level, goals: lesson.goals, lose: lesson.lose, classes, earned: new Set(data.earned), v2 });
  } catch (err) {
    return report(err);
  }

  const snapshot = objectSnapshots();
  sendObjects = () => send({ type: "objects", objects: snapshot(run.objects) });
  let last = "";
  let lastLabels = "[]";
  let frames = 0; // drawn so far: the animation clock, which stops while paused
  let inspectFrames = 0;
  const frame = () => {
    if (paused) return void (pausedFrame = frame);
    send({ type: "tick" });
    const result = run.step();
    if ("error" in result) {
      if (result.lines.length) send({ type: "logs", lines: result.lines });
      return report(result.error); // stop the loop: the game pauses on the error
    }
    if (inspectOpen && inspectFrames++ % 6 === 0) sendObjects?.();
    if (result.lines.length) send({ type: "logs", lines: result.lines });
    if (v2 && result.sounds.length) send({ type: "sounds", names: result.sounds });
    if (result.earned.length) send({ type: "achievements", ids: result.earned });
    const json = JSON.stringify(result.check);
    if (json !== last) send({ type: "check", ...result.check });
    last = json;
    const gui = JSON.stringify(result.labels);
    if (gui !== lastLabels) send({ type: "labels", labels: result.labels });
    lastLabels = gui;
    drawWorld(ctx, sprites, Camera.main, run.objects, v2 ? frames++ / 60 : undefined, own);
    if (!result.check.lost && !result.check.passed) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
