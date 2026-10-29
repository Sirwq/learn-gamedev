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
  transform!: Transform; // set by the engine right after construction
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

/** Canvas top-left y for a box at bottom-left y. */
export const flipY = (y: number, h: number, height: number) => height - y - h;

/** Appends (on a new last line, so error lines stay put) an export of the Script's class, so the stub needs no `export`. */
export const scriptSource = (js: string, name: string) =>
  `${js}\nexport const __script = typeof ${name} === "undefined" ? undefined : ${name};`;

export function findScript(mod: { __script?: unknown }, name: string): new () => MonoBehaviour {
  const cls = mod.__script;
  if (typeof cls === "function" && cls.prototype instanceof MonoBehaviour) return cls as new () => MonoBehaviour;
  throw new Error(`${name}.ts must define class ${name} extends MonoBehaviour`);
}

/** What a Script sees as globals. */
export const api = { MonoBehaviour, Vector2, Time, Input, KeyCode, Debug };

export type GameObject = Box & { transform: Transform };

/** Spawns the Level, attaches one new Script instance per scripted box and calls Start. */
export function startGame(level: Box[], scripts: Record<string, new () => MonoBehaviour>) {
  const objects: GameObject[] = level.map((box) => ({ ...box, transform: new Transform(new Vector2(box.x, box.y)) }));
  const behaviours = objects.filter((o) => o.script).map((o) => {
    const b = new scripts[o.script!]();
    b.transform = o.transform;
    return b;
  });
  for (const b of behaviours) b.Start?.();
  return {
    objects,
    step() {
      nextFrame();
      for (const b of behaviours) b.Update?.();
    },
  };
}

/** Read-only snapshot of the game objects for Goals and Lose events. */
export type World = readonly Readonly<Omit<Box, "script">>[];

export const worldView = (objects: GameObject[]): World =>
  objects.map(({ tag, w, h, color, transform: { position } }) => ({ tag, x: position.x, y: position.y, w, h, color }));
