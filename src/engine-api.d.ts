/**
 * An x, y pair in pixels. Read-only: make a new one instead of changing x or y.
 * @example new Vector2(3, 0)
 * @unity C# changes a copy with `v.x = 5`; here `x` and `y` are read-only, so write `new Vector2(5, v.y)`.
 */
declare class Vector2 {
  /**
   * Makes a vector: 3 pixels right, 0 pixels up.
   * @example new Vector2(3, 0)
   */
  constructor(x: number, y: number);
  /**
   * Horizontal part, in pixels; grows to the right.
   * @example this.transform.position.x
   */
  readonly x: number;
  /**
   * Vertical part, in pixels; grows upward.
   * @example this.transform.position.y
   */
  readonly y: number;
  /**
   * Returns this vector plus `other`.
   * @example this.transform.position = this.transform.position.Add(new Vector2(3, 0));
   * @unity C# writes `a + b`; TypeScript has no operators for classes, so write `a.Add(b)`.
   */
  Add(other: Vector2): Vector2;
  /**
   * Returns this vector times `n`.
   * @example new Vector2(this.speed, 0).Scale(Time.deltaTime)
   * @unity C# writes `a * n`; write `a.Scale(n)`.
   */
  Scale(n: number): Vector2;
}

/**
 * Where a game object is.
 * @example this.transform
 */
declare class Transform {
  /**
   * Bottom-left corner of the box in pixels, origin bottom-left, y up. Assign a new Vector2 to move.
   * @example this.transform.position = new Vector2(100, 40);
   * @unity C# writes `transform.position += v;`; here write `this.transform.position = this.transform.position.Add(v);`.
   */
  position: Vector2;
}

/**
 * Base class for every Script.
 * @example class Player extends MonoBehaviour { Update() { } }
 * @unity C# needs `using UnityEngine;` and `public class Player : MonoBehaviour`; TypeScript uses `class Player extends MonoBehaviour`. Fields are `speed = 5;` instead of `public float speed = 5f;`.
 */
declare class MonoBehaviour {
  /**
   * The game object this Script is attached to.
   * @example Destroy(this.gameObject);
   * @unity C# leaves out `this.`; TypeScript needs it.
   */
  readonly gameObject: GameObject;
  /**
   * The Transform of the game object this Script is attached to.
   * @example this.transform.position
   * @unity C# leaves out `this.`; TypeScript needs it before every field and method of the Script.
   */
  readonly transform: Transform;
  /**
   * Called once, before the first Update.
   * @example Start() { Debug.Log("ready"); }
   * @unity C# writes `void Start()`; TypeScript leaves out the return type.
   */
  Start?(): void;
  /**
   * Called once every frame, 60 times a second.
   * @example Update() { this.transform.position = this.transform.position.Add(new Vector2(3, 0)); }
   * @unity C# writes `void Update()`; TypeScript leaves out the return type.
   */
  Update?(): void;
}

/**
 * A box in the game, from the Level or made with `Instantiate`.
 * @example GameObject.FindGameObjectsWithTag("Enemy")[0]
 */
declare class GameObject {
  /**
   * The tag it was made with.
   * @example if (other.tag === "Enemy") { }
   */
  readonly tag: string;
  /**
   * Where it is.
   * @example wall.transform.position.x
   */
  readonly transform: Transform;
  /**
   * Width of the box in pixels.
   * @example this.transform.position.x + this.gameObject.w
   * @unity C# reads the size from a collider: `GetComponent<BoxCollider2D>().size.x`.
   */
  readonly w: number;
  /**
   * Height of the box in pixels.
   * @example box.transform.position.y + box.h
   * @unity C# reads the size from a collider: `GetComponent<BoxCollider2D>().size.y`.
   */
  readonly h: number;
  /**
   * Every object with this tag.
   * @example GameObject.FindGameObjectsWithTag("Enemy").length
   * @unity C# arrays have `.Length`; TypeScript arrays have `.length`.
   */
  static FindGameObjectsWithTag(tag: string): GameObject[];
}

/**
 * What `Instantiate` makes: a box's tag, width and height in pixels, color, and the Script to attach by file name.
 * @example { tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" }
 * @unity C# uses a prefab made in the editor instead.
 */
type Prefab = { tag: string; w: number; h: number; color: string; script?: string };

/**
 * Makes a new object at `position`. Its Start runs before its first Update, on the next frame.
 * @example Instantiate({ tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" }, this.transform.position);
 * @unity C# passes a prefab from the editor; here you pass a Prefab object.
 */
declare function Instantiate(original: Prefab, position: Vector2): GameObject;

/**
 * Removes an object from the game at the end of this frame. Until then it still shows up in `FindGameObjectsWithTag`.
 * @example Destroy(this.gameObject);
 */
declare function Destroy(obj: GameObject): void;

/**
 * Game time.
 * @example Time.deltaTime
 */
declare class Time {
  /**
   * Seconds since the last frame.
   * @example this.speed * Time.deltaTime
   * @unity In Unity it changes with the frame rate; here it is always 1/60, so every run plays out the same.
   */
  static readonly deltaTime: number;
}

/**
 * Keyboard state for the current frame.
 * @example Input.GetKey(KeyCode.RightArrow)
 */
declare class Input {
  /**
   * True while the key is held down.
   * @example if (Input.GetKey(KeyCode.RightArrow)) { }
   */
  static GetKey(key: KeyCode): boolean;
  /**
   * True only on the frame the key was pressed.
   * @example if (Input.GetKeyDown(KeyCode.Space)) { }
   */
  static GetKeyDown(key: KeyCode): boolean;
  /**
   * True only on the frame the key was released.
   * @example if (Input.GetKeyUp(KeyCode.Space)) { }
   */
  static GetKeyUp(key: KeyCode): boolean;
}

/**
 * Keys the game can read.
 * @example KeyCode.Space
 */
declare enum KeyCode {
  /**
   * Left arrow key.
   * @example Input.GetKey(KeyCode.LeftArrow)
   */
  LeftArrow,
  /**
   * Right arrow key.
   * @example Input.GetKey(KeyCode.RightArrow)
   */
  RightArrow,
  /**
   * Up arrow key.
   * @example Input.GetKey(KeyCode.UpArrow)
   */
  UpArrow,
  /**
   * Down arrow key.
   * @example Input.GetKey(KeyCode.DownArrow)
   */
  DownArrow,
  /**
   * W key.
   * @example Input.GetKey(KeyCode.W)
   */
  W,
  /**
   * A key.
   * @example Input.GetKey(KeyCode.A)
   */
  A,
  /**
   * S key.
   * @example Input.GetKey(KeyCode.S)
   */
  S,
  /**
   * D key.
   * @example Input.GetKey(KeyCode.D)
   */
  D,
  /**
   * Space bar.
   * @example Input.GetKeyDown(KeyCode.Space)
   */
  Space,
}

/**
 * Writes to the Console under the editor. The same line many times in a row shows once with a count.
 * @example Debug.Log("hello");
 */
declare class Debug {
  /**
   * Writes a line. Anything works: numbers and Vector2s too.
   * @example Debug.Log("coins: " + this.coins);
   */
  static Log(message: unknown): void;
  /**
   * Writes a yellow warning line.
   * @example Debug.LogWarning("almost out of time");
   */
  static LogWarning(message: unknown): void;
  /**
   * Writes a red error line. The game keeps running.
   * @example Debug.LogError("fell through the floor");
   */
  static LogError(message: unknown): void;
}

/**
 * What the player sees. There is one: `Camera.main`. It does not follow anything on its own; move it from a Script.
 * @example Camera.main.transform.position = this.transform.position;
 */
declare class Camera {
  /**
   * The game's camera.
   * @example Camera.main.transform.position = this.transform.position;
   */
  static readonly main: Camera;
  /**
   * Where it is: `position` is the centre of the view in pixels, starting at (480, 270).
   * @example Camera.main.transform.position
   */
  readonly transform: Transform;
  /**
   * Half the view height in pixels, 270 to start. Smaller zooms in, bigger zooms out.
   * @example Camera.main.orthographicSize = 200;
   */
  orthographicSize: number;
}
