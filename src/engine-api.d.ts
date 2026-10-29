/** An x, y pair in pixels. Read-only like a C# struct: make a new one instead of changing x or y. */
declare class Vector2 {
  /** Makes a vector, e.g. `new Vector2(100, 0)`. */
  constructor(x: number, y: number);
  /** Horizontal part, in pixels; grows to the right. */
  readonly x: number;
  /** Vertical part, in pixels; grows upward. */
  readonly y: number;
  /** Returns this vector plus `other` (C# uses `a + b`). */
  Add(other: Vector2): Vector2;
  /** Returns this vector times `n` (C# uses `a * n`). */
  Scale(n: number): Vector2;
}

/** Where a game object is. */
declare class Transform {
  /** Bottom-left corner of the box in pixels, origin bottom-left, y up. Assign a new Vector2 to move. */
  position: Vector2;
}

/** Base class for every Script: `class Player extends MonoBehaviour { ... }`. */
declare class MonoBehaviour {
  /** The game object this Script is attached to, e.g. `Destroy(this.gameObject)`. */
  readonly gameObject: GameObject;
  /** The Transform of the game object this Script is attached to (C# leaves out `this.`). */
  readonly transform: Transform;
  /** Called once, before the first Update. */
  Start?(): void;
  /** Called once every frame, 60 times a second. */
  Update?(): void;
}

/** A box in the game, from the Level or made with `Instantiate`. */
declare class GameObject {
  /** The tag it was made with, e.g. `"Enemy"`. */
  readonly tag: string;
  /** Where it is. */
  readonly transform: Transform;
  /** Every object with this tag, e.g. `GameObject.FindGameObjectsWithTag("Enemy").length`. */
  static FindGameObjectsWithTag(tag: string): GameObject[];
}

/** What `Instantiate` makes: a box's tag, width and height in pixels, color, and the Script to attach by file name. Unity C# uses a prefab made in the editor instead. */
type Prefab = { tag: string; w: number; h: number; color: string; script?: string };

/** Makes a new object at `position`, e.g. `Instantiate({ tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" }, this.transform.position)`. Its Start runs before its first Update, on the next frame. */
declare function Instantiate(original: Prefab, position: Vector2): GameObject;

/** Removes an object from the game at the end of this frame, e.g. `Destroy(this.gameObject)`. Until then it still shows up in `FindGameObjectsWithTag`. */
declare function Destroy(obj: GameObject): void;

/** Game time. */
declare class Time {
  /** Seconds since the last frame. Always 1/60, so every run plays out the same. */
  static readonly deltaTime: number;
}

/** Keyboard state for the current frame. */
declare class Input {
  /** True while the key is held down. */
  static GetKey(key: KeyCode): boolean;
  /** True only on the frame the key was pressed. */
  static GetKeyDown(key: KeyCode): boolean;
  /** True only on the frame the key was released. */
  static GetKeyUp(key: KeyCode): boolean;
}

/** Keys the game can read. */
declare enum KeyCode {
  /** Left arrow key. */
  LeftArrow,
  /** Right arrow key. */
  RightArrow,
  /** Up arrow key. */
  UpArrow,
  /** Down arrow key. */
  DownArrow,
  /** W key. */
  W,
  /** A key. */
  A,
  /** S key. */
  S,
  /** D key. */
  D,
  /** Space bar. */
  Space,
}

/** Writes to the Console under the editor. The same line many times in a row shows once with a count. */
declare class Debug {
  /** Writes a line, e.g. `Debug.Log("coins: " + coins)`. Anything works: numbers and Vector2s too. */
  static Log(message: unknown): void;
  /** Writes a yellow warning line. */
  static LogWarning(message: unknown): void;
  /** Writes a red error line. The game keeps running. */
  static LogError(message: unknown): void;
}
