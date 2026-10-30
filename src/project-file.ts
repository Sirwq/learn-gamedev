// Portable Project files: validation and encoding never read browser storage.
import type { Project } from "./sandbox";
import { t } from "./i18n";

export const PROJECT_FORMAT = "learn-dev-project";
const VERSION = 1;
const MAX_IMAGE = 256;
const PNG_URL = "data:image/png;base64,";

/** `<name>.learn-dev.json`, with characters no file system allows replaced. */
export const exportFileName = (name: string) => `${name.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim() || "Project"}.learn-dev.json`;

/** Builds the existing portable file shape from a complete Project and its images. */
export async function encodeProjectFile(project: Omit<Project, "id">, images: Record<string, Blob>) {
  const encoded: Record<string, string> = {};
  for (const [name, blob] of Object.entries(images)) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let bin = "";
    for (const byte of bytes) bin += String.fromCharCode(byte);
    encoded[name] = PNG_URL + btoa(bin);
  }
  return { format: PROJECT_FORMAT, version: VERSION, project, images: encoded };
}

const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isArt = (a: unknown) => isObj(a) && (a.draw === "stretch" || a.draw === "tile") && typeof a.pixel === "boolean";
const isBox = (b: unknown) => isObj(b) && typeof b.tag === "string" && typeof b.color === "string" &&
  ["x", "y", "w", "h"].every((k) => isNum(b[k])) && (b.script === undefined || typeof b.script === "string");

/** The PNG's bytes, or why the data URL is refused. Reads the header only: nothing from the file is decoded or drawn. */
function pngBytes(url: unknown): Uint8Array | string {
  if (typeof url !== "string" || !url.startsWith(PNG_URL)) return t("an image that isn't a PNG");
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(url.slice(PNG_URL.length)), (c) => c.charCodeAt(0));
  } catch {
    return t("a broken image");
  }
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || sig.some((b, i) => bytes[i] !== b)) return t("an image that isn't a PNG");
  const view = new DataView(bytes.buffer);
  if (view.getUint32(16) > MAX_IMAGE || view.getUint32(20) > MAX_IMAGE) return t("an image bigger than {size}×{size}", { size: MAX_IMAGE });
  return bytes;
}

/** A checked Project file: the Project without its id, and its images as PNG Blobs by `<tag>[:top]`. */
export type ProjectFile = { project: Omit<Project, "id">; pngs: [string, Blob][] };

/** Checks one exported Project (the parsed file); throws a plain message for a bad one. */
export function checkProjectFile(file: unknown): ProjectFile {
  const bad = (why: string) => new Error(t("This file can't be opened: {why}.", { why }));
  if (!isObj(file) || file.format !== PROJECT_FORMAT) throw bad(t("it isn't a learn-dev Project file"));
  if (!isNum(file.version) || (file.version as number) > VERSION) throw bad(t("it comes from a newer learn-dev. Reload the page and try again"));
  const { project: p, images = {} } = file;
  const level = isObj(p) ? p.level : undefined;
  if (!isObj(p) || typeof p.name !== "string" || !isObj(p.scripts) || !isObj(level) || !Array.isArray(level.boxes) ||
    !Object.entries(p.scripts).every(([n, c]) => /^[A-Z][A-Za-z0-9_]*$/.test(n) && typeof c === "string") ||
    !level.boxes.every(isBox) || !["width", "height"].every((k) => level[k] === undefined || isNum(level[k])) ||
    !(level.art === undefined || (isObj(level.art) && Object.values(level.art).every(isArt))) ||
    !(level.camera === undefined || (isObj(level.camera) && ["x", "y", "size"].every((k) => isNum((level.camera as Record<string, unknown>)[k])))) ||
    !isObj(images))
    throw bad(t("the Project in it is damaged"));
  const pngs: [string, Blob][] = [];
  for (const [k, url] of Object.entries(images)) {
    if (!/^[\w%.!~*'()-]+(:top)?$/.test(k)) throw bad(t("the Project in it is damaged")); // imageName: an escaped tag
    const bytes = pngBytes(url);
    if (typeof bytes === "string") throw bad(t("it has {problem}", { problem: bytes }));
    pngs.push([k, new Blob([bytes as BlobPart], { type: "image/png" })]);
  }
  return { project: { name: p.name, scripts: p.scripts as Project["scripts"], level: level as Project["level"] }, pngs };
}

