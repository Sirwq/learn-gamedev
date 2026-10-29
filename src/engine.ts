// Runtime behind the student API. Student-facing types and docs live in engine-api.d.ts.
import { addLine, type ConsoleLine } from "./console";

/** A box in a Level: x, y is the bottom-left corner, y up. */
export type Box = { tag: string; x: number; y: number; w: number; h: number; color: string; script?: string };

export class Vector2 {
  constructor(readonly x: number, readonly y: number) {}
  Add(other: Vector2) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }
  Scale(n: number) {
    return new Vector2(this.x * n, this.y * n);
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

export class Transform {
  constructor(public position: Vector2) {}
}

export class MonoBehaviour {
  gameObject!: GameObject; // both set by the engine right after construction
  transform!: Transform;
  Start?(): void;
  Update?(): void;
}

export class Time {
  static readonly deltaTime = 1 / 60;
}

// Values are KeyboardEvent.code, so WASD stays put on any keyboard layout.
export const KeyCode = {
  LeftArrow: "ArrowLeft", RightArrow: "ArrowRight", UpArrow: "ArrowUp", DownArrow: "ArrowDown",
  W: "KeyW", A: "KeyA", S: "KeyS", D: "KeyD", Space: "Space",
};

const held = new Set<string>();
let pressed = new Set<string>(), released = new Set<string>();
let down = new Set<string>(), up = new Set<string>();

export function keyEvent(code: string, isDown: boolean) {
  if (isDown && !held.has(code)) (held.add(code), pressed.add(code));
  if (!isDown && held.delete(code)) released.add(code);
}

/** Lets go of every held key, as if each was released now. */
export function releaseAllKeys() {
  for (const code of held) keyEvent(code, false);
}

/** Call once at the start of each frame: key presses since the last frame become this frame's Down / Up. */
export function nextFrame() {
  [down, up, pressed, released] = [pressed, released, new Set(), new Set()];
}

export class Input {
  static GetKey(code: string) {
    return held.has(code) || down.has(code); // a tap shorter than a frame still counts as held for that frame
  }
  static GetKeyDown(code: string) {
    return down.has(code);
  }
  static GetKeyUp(code: string) {
    return up.has(code);
  }
}

/** Debug lines written since the worker last sent them to the Console; collapsed and capped like the Console itself. */
export const logs: ConsoleLine[] = [];

export class Debug {
  static Log(message: unknown) {
    addLine(logs, "log", String(message));
  }
  static LogWarning(message: unknown) {
    addLine(logs, "warn", String(message));
  }
  static LogError(message: unknown) {
    addLine(logs, "error", String(message));
  }
}

/** A Level's start camera: view centre x, y and orthographicSize, in pixels. */
export type CameraStart = { x: number; y: number; size: number };

export class Camera {
  static main: Camera;
  orthographicSize: number;
  readonly transform: Transform;
  constructor({ x, y, size }: CameraStart = { x: 480, y: 270, size: 270 }) {
    this.transform = new Transform(new Vector2(x, y));
    this.orthographicSize = size;
  }
}
Camera.main = new Camera();

/** Canvas rect (top-left, y down) for a world box (bottom-left, y up) seen through the camera on a viewW×viewH canvas. */
export function toScreen(camera: Camera, box: { x: number; y: number; w: number; h: number }, viewW: number, viewH: number) {
  const scale = viewH / 2 / camera.orthographicSize;
  const { x, y } = camera.transform.position;
  return { x: viewW / 2 + (box.x - x) * scale, y: viewH / 2 - (box.y + box.h - y) * scale, w: box.w * scale, h: box.h * scale };
}

/** Appends (on a new last line, so error lines stay put) an export of the Script's class, so the stub needs no `export`. */
export const scriptSource = (js: string, name: string) =>
  `${js}\nexport const __script = typeof ${name} === "undefined" ? undefined : ${name};`;

export function findScript(mod: { __script?: unknown }, name: string): new () => MonoBehaviour {
  const cls = mod.__script;
  if (typeof cls === "function" && cls.prototype instanceof MonoBehaviour) return cls as new () => MonoBehaviour;
  throw new Error(`${name}.ts must define class ${name} extends MonoBehaviour`);
}

/** What Instantiate copies: a Level box without the position. */
export type Prefab = Omit<Box, "x" | "y">;

export class GameObject {
  readonly transform: Transform;
  destroyed = false;
  constructor(readonly tag: string, readonly w: number, readonly h: number, readonly color: string, readonly script: string | undefined, position: Vector2) {
    this.transform = new Transform(position);
  }
  static FindGameObjectsWithTag(tag: string) {
    return game!.objects.filter((o) => o.tag === tag);
  }
}

type Scripts = Record<string, new () => MonoBehaviour>;
let game: { objects: GameObject[]; behaviours: MonoBehaviour[]; fresh: MonoBehaviour[]; scripts: Scripts } | undefined;

export function Instantiate({ tag, w, h, color, script }: Prefab, position: Vector2) {
  const o = new GameObject(tag, w, h, color, script, position);
  game!.objects.push(o);
  if (script) {
    const Script = game!.scripts[script];
    if (!Script) throw new Error(`There is no Script named ${script}`);
    const b = new Script();
    b.gameObject = o;
    b.transform = o.transform;
    game!.fresh.push(b);
  }
  return o;
}

/** Marks the object; it is removed at the end of the frame, like Unity. */
export function Destroy(obj: GameObject) {
  obj.destroyed = true;
}

const keep = <T>(list: T[], f: (t: T) => boolean) => void list.splice(0, list.length, ...list.filter(f));

/** What a Script sees as globals. */
export const api = { MonoBehaviour, GameObject, Instantiate, Destroy, Vector2, Time, Input, KeyCode, Debug, Camera };

/** Spawns the Level, resets Camera.main, attaches one new Script instance per scripted box and calls Start. */
export function startGame(level: Box[], scripts: Scripts, camera?: CameraStart) {
  Camera.main = new Camera(camera);
  const g: NonNullable<typeof game> = (game = { objects: [], behaviours: [], fresh: [], scripts });
  // Start runs once, before a Script's first Update; Scripts made inside Start get started too.
  const startFresh = () => {
    for (let b; (b = g.fresh.shift()); ) if (!b.gameObject.destroyed) (g.behaviours.push(b), b.Start?.());
  };
  const sweep = () => {
    keep(g.objects, (o) => !o.destroyed);
    keep(g.behaviours, (b) => !b.gameObject.destroyed);
  };
  for (const box of level) Instantiate(box, new Vector2(box.x, box.y));
  startFresh();
  sweep();
  return {
    objects: g.objects,
    step() {
      nextFrame();
      startFresh(); // objects made last frame
      for (const b of g.behaviours) b.Update?.();
      sweep();
    },
  };
}

/** Read-only snapshot of the game objects for Goals and Lose events. */
export type World = readonly Readonly<Omit<Box, "script">>[];

export const worldView = (objects: GameObject[]): World =>
  objects.map(({ tag, w, h, color, transform: { position } }) => ({ tag, x: position.x, y: position.y, w, h, color }));
