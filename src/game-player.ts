// Standalone export entry: no editor, storage, course progress or analytics.
import { api, Camera, findScript, keyEvent, labels, logs, releaseAllKeys, scriptSource, startGame, takeSounds, type Clip, type MonoBehaviour } from "./engine";
import { drawWorld, loadImages, ownSprites } from "./sprites";
import { drawLabels, textList } from "./gui";
import type { Project } from "./sandbox";

type Payload = { project: Omit<Project, "id">; images: Record<string, string>; sounds: Record<Clip, string>; font: string };
const data: Payload = JSON.parse(document.getElementById("game-data")!.textContent!);
const canvas = document.getElementById("game") as HTMLCanvasElement;
const overlay = document.getElementById("gui") as HTMLCanvasElement;
const button = document.getElementById("play") as HTMLButtonElement;
const status = document.getElementById("status")!;
const muted = document.getElementById("mute") as HTMLInputElement;
const showLabels = textList((texts) => { document.getElementById("labels")!.textContent = texts.join("\n"); });
let frame = 0;
let audio: AudioContext | undefined;
const buffers = new Map<string, AudioBuffer>();
const playing = new Set<AudioBufferSourceNode>();
const sprites = loadImages();
const own = Promise.all(Object.entries(data.images).map(async ([name, url]) => [name, await (await fetch(url)).blob()] as const))
  .then((pairs) => ownSprites(data.project.level.art, Object.fromEntries(pairs)));
const font = new FontFace("Kenney Pixel", `url(${data.font})`);
document.fonts.add(font);
const readyFont = font.load();
Object.assign(globalThis, api);

function silence() {
  for (const source of playing) source.stop();
  playing.clear();
}
window.addEventListener("blur", () => { releaseAllKeys(); silence(); });
for (const type of ["keydown", "keyup"] as const) canvas.addEventListener(type, (event) => {
  if (event.code.startsWith("Arrow") || event.code === "Space") event.preventDefault();
  keyEvent(event.code, type === "keydown");
});
canvas.addEventListener("blur", releaseAllKeys);
muted.onchange = () => { if (muted.checked) silence(); };
button.onclick = async () => {
  cancelAnimationFrame(frame);
  silence();
  button.disabled = true;
  status.textContent = "";
  try {
    if (!audio) {
      try {
        audio = new AudioContext();
        const ctx = audio;
        for (const [name, url] of Object.entries(data.sounds)) {
          void fetch(url).then((r) => r.arrayBuffer()).then((bytes) => ctx.decodeAudioData(bytes))
            .then((buffer) => buffers.set(name, buffer)).catch(() => {});
        }
      } catch { /* Browsers without audio can still play. */ }
    }
    void audio?.resume().catch(() => {});
    const [images, custom] = await Promise.all([sprites, own, readyFont]);
    const classes: Record<string, new () => MonoBehaviour> = {};
    for (const [name, code] of Object.entries(data.project.scripts)) {
      const url = URL.createObjectURL(new Blob([scriptSource(code, name)], { type: "text/javascript" }));
      try { classes[name] = findScript(await import(/* @vite-ignore */ url), name); }
      finally { URL.revokeObjectURL(url); }
    }
    Object.assign(globalThis, classes);
    const game = startGame(data.project.level.boxes, classes, data.project.level.camera, true);
    let ticks = 0;
    const step = () => {
      try {
        if (document.hasFocus()) {
          game.step();
          drawWorld(canvas.getContext("2d")!, images, Camera.main, game.objects, ticks++ / 60, custom);
          drawLabels(overlay.getContext("2d")!, labels);
          showLabels(labels);
          for (const name of takeSounds()) {
            if (muted.checked || !audio || !buffers.has(name)) continue;
            const source = audio.createBufferSource();
            source.buffer = buffers.get(name)!;
            source.connect(audio.destination);
            playing.add(source);
            source.onended = () => playing.delete(source);
            source.start();
          }
          logs.length = 0;
        }
        frame = requestAnimationFrame(step);
      } catch (error) { status.textContent = String(error); silence(); }
    };
    canvas.focus();
    frame = requestAnimationFrame(step);
  } catch (error) { status.textContent = String(error); }
  finally { button.disabled = false; }
};
// shortcut: exported scripts run on the page thread; add worker isolation if untrusted game distribution becomes a product feature.
