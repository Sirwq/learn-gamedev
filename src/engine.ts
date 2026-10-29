// Runtime behind the student API. Student-facing types and docs live in engine-api.d.ts.

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
