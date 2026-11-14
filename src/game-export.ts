// A portable game contains only the selected project and bundled runtime assets.
import runtime from "../.generated/game-player.js?raw";
import { CLIPS } from "./engine";
import { transpile } from "./run-utils";
import { encodeProjectFile } from "./project-file";
import type { Project } from "./sandbox";
import { escapeHtml, t } from "./i18n";

async function asset(path: string, type: string) {
  const response = await fetch(import.meta.env.BASE_URL + path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  let binary = "";
  for (const byte of new Uint8Array(await response.arrayBuffer())) binary += String.fromCharCode(byte);
  return `data:${type};base64,${btoa(binary)}`;
}

export async function exportGame(project: Project, images: Record<string, Blob>) {
  const copy = { name: project.name, level: structuredClone(project.level), scripts: Object.fromEntries(
    Object.entries(project.scripts).map(([name, code]) => [name, transpile(code)])),
  };
  const file = await encodeProjectFile(copy, images);
  const [font, sounds] = await Promise.all([
    asset("fonts/KenneyPixel.ttf", "font/ttf"),
    Promise.all(CLIPS.map(async (name) => [name, await asset(`audio/${name}.mp3`, "audio/mpeg")])),
  ]);
  const payload = JSON.stringify({ project: file.project, images: file.images, font, sounds: Object.fromEntries(sounds) }).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="${document.documentElement.lang || "en"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(copy.name)}</title>
<style>body{margin:24px;background:#171b25;color:#eee;font:18px system-ui;text-align:center}button,label{margin:8px;font:inherit}#stage{position:relative;width:min(960px,100%);margin:auto}canvas{width:100%;display:block}#gui{position:absolute;inset:0;pointer-events:none}#game:focus{outline:2px solid #9cf}#status{color:#ffbaba;white-space:pre-wrap}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}</style>
<h1>${escapeHtml(copy.name)}</h1><button id="play">${escapeHtml(t("Play / Restart"))}</button><label><input id="mute" type="checkbox">${escapeHtml(t("Mute"))}</label>
<p>${escapeHtml(t("Open this HTML file in a desktop browser, then press Play. Click the game to use its keyboard controls. Arrow keys / WASD, Space, S: depends on the game."))}</p>
<div id="stage"><canvas id="game" width="960" height="540" tabindex="0" aria-label="${escapeHtml(copy.name)}"></canvas><canvas id="gui" width="960" height="540" aria-hidden="true"></canvas></div>
<p id="status" role="alert"></p><div id="labels" class="sr" aria-live="polite"></div>
<script type="application/json" id="game-data">${payload}</script><script>${runtime.replace(/<\/script/gi, "<\\/script")}</script></html>`;
}
