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
   * Once when two enabled boxes begin overlapping, after Update and before OnGUI. Both must opt in.
   * @example OnTriggerEnter2D(other: Collider2D) { if (other.gameObject.tag === "Coin") Destroy(other.gameObject); }
   */
  OnTriggerEnter2D?(other: Collider2D): void;
  /** Once per following step while overlapping. Callback movement is observed next step; spawned objects wait until Start. */
  OnTriggerStay2D?(other: Collider2D): void;
  /** Once after separation or destruction, on the surviving script. The other object may already be destroyed. */
  OnTriggerExit2D?(other: Collider2D): void;

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
   * Plays the game's sounds.
   * @example this.audio.PlayOneShot("Jump");
   * @unity C# needs an AudioSource component and a clip: `GetComponent<AudioSource>().PlayOneShot(clip)`; here every Script has `this.audio` and the clip is a name.
   */
  readonly audio: AudioSource;
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
  /**
   * Called every frame after Update, to draw screen text with `GUI.Label`. Shows in Sandbox and Chapter 2 Lessons; Lessons 1–15 draw nothing.
   * @example OnGUI() { GUI.Label(new Rect(16, 16, 300, 30), "Coins: " + this.coins); }
   * @unity C# writes `void OnGUI()`; TypeScript leaves out the return type.
   */
  OnGUI?(): void;
}

/**
 * Plays sounds. Every Script has one: `this.audio`. Sounds play in Sandbox and Chapter 2 Lessons; Lessons 1–15 stay silent.
 * @example this.audio.PlayOneShot("Coin");
 */
declare class AudioSource {
  /**
   * Plays one of the ten built-in sounds once. The same sound played several times in one frame plays once.
   * @example this.audio.PlayOneShot("Jump");
   * @unity C# passes an AudioClip from the editor: `GetComponent<AudioSource>().PlayOneShot(clip)`; here you pass the clip's name.
   */
  PlayOneShot(clip: "Jump" | "Coin" | "Hit" | "Hurt" | "Shoot" | "Explosion" | "Powerup" | "Win" | "Lose" | "Click"): void;
}

/**
 * A box contact sensor. Enable Contact notifications on both Sandbox objects. No physical blocking or Rigidbody2D is needed.
 * Contacts use positive-area overlap after Update. Edges alone do not count; fast objects can pass through between steps.
 * @example OnTriggerEnter2D(other: Collider2D) { if (other.gameObject.tag === "Coin") Destroy(other.gameObject); }
 * @unity This tutor implements box notifications only, not Unity's full physics system.
 */
declare class Collider2D {
  /** The other object, including its tag. */
  readonly gameObject: GameObject;
  /** The object's Transform. */
  readonly transform: Transform;
}

/**
 * A box in the game, from the Level or made with `Instantiate`.
 * @example GameObject.FindGameObjectsWithTag("Enemy")[0]
 */
declare class GameObject {
  /** Contact sensor, or null when disabled. Chosen in the Level editor or Instantiate prefab. */
  readonly collider: Collider2D | null;
  /**
   * The tag it was made with. The tag picks how it looks: in Sandbox, the 🗺 Level tab can give a tag your own image (PNG or JPEG, drawn facing right). Draw one in a free pixel-art editor such as Piskel (https://www.piskelapp.com) or Aseprite (https://www.aseprite.org).
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
type Prefab = { tag: string; w: number; h: number; color: string; script?: string; collider?: boolean };

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

/**
 * Draws text over the game, from `OnGUI`. It stays put when `Camera.main` moves.
 * @example GUI.Label(new Rect(16, 16, 300, 30), "Coins: " + this.coins);
 */
declare class GUI {
  /**
   * Draws `text` in `position` for this frame. `\n` starts a new line; long text is not wrapped or cut off.
   * @example GUI.Label(new Rect(16, 16, 300, 30), "Coins: " + this.coins);
   */
  static Label(position: Rect, text: string): void;
  /**
   * Colour of the next labels; white at the start of every `OnGUI`.
   * @example GUI.color = Color.yellow;
   * @unity Unity keeps `GUI.color` from one frame to the next; here it goes back to white at the start of every `OnGUI`.
   */
  static color: Color;
  /**
   * The label style: `GUI.skin.label`.
   * @example GUI.skin.label.fontSize = 32;
   */
  static readonly skin: GUISkin;
}

/**
 * Holds the label style. There is one: `GUI.skin`.
 * @example GUI.skin.label.alignment = TextAnchor.MiddleCenter;
 */
declare class GUISkin {
  /**
   * The style `GUI.Label` draws with.
   * @example GUI.skin.label.fontSize = 32;
   */
  readonly label: GUIStyle;
}

/**
 * How labels look. Every setting goes back to its default at the start of every `OnGUI`.
 * @example GUI.skin.label.fontSize = 32;
 * @unity Unity keeps the style from one frame to the next and lets you make new GUIStyles; here there is only `GUI.skin.label`, reset every `OnGUI`.
 */
declare class GUIStyle {
  /**
   * Text size in pixels, 32 to start. Rounds to a multiple of 16 so the pixel font stays crisp.
   * @example GUI.skin.label.fontSize = 48;
   */
  fontSize: number;
  /**
   * Where the text sits inside its Rect, `TextAnchor.UpperLeft` to start.
   * @example GUI.skin.label.alignment = TextAnchor.MiddleCenter;
   */
  alignment: TextAnchor;
  /**
   * A thin dark outline that keeps text readable on any background, on to start.
   * @example GUI.skin.label.outline = false;
   * @unity Not in Unity: C# adds an `Outline` component to a UI Text instead.
   */
  outline: boolean;
}

/**
 * A rectangle on the screen in pixels: x, y is the top-left corner of the 960×540 view, y grows down.
 * @example new Rect(16, 16, 300, 30)
 * @unity Same as Unity's GUI Rect. Mind that it is the other way up from the world, where y starts at the bottom and grows up.
 */
declare class Rect {
  /**
   * Makes a rectangle: left, top, width, height.
   * @example new Rect(16, 16, 300, 30)
   */
  constructor(x: number, y: number, width: number, height: number);
  /**
   * Left edge, from the left of the view.
   * @example new Rect(16, 16, 300, 30).x
   */
  x: number;
  /**
   * Top edge, from the top of the view; grows downward.
   * @example new Rect(16, 16, 300, 30).y
   */
  y: number;
  /**
   * Width; only matters for alignment.
   * @example new Rect(0, 0, 960, 540).width
   */
  width: number;
  /**
   * Height; only matters for alignment.
   * @example new Rect(0, 0, 960, 540).height
   */
  height: number;
}

/**
 * A colour from red, green and blue, each 0 to 1.
 * @example new Color(1, 0.5, 0)
 */
declare class Color {
  /**
   * Makes a colour: red, green and blue from 0 to 1.
   * @example GUI.color = new Color(1, 0.5, 0);
   * @unity C# writes `new Color(1f, 0.5f, 0f)`; TypeScript numbers need no `f`.
   */
  constructor(r: number, g: number, b: number);
  /**
   * Red, 0 to 1.
   * @example GUI.color.r
   */
  readonly r: number;
  /**
   * Green, 0 to 1.
   * @example GUI.color.g
   */
  readonly g: number;
  /**
   * Blue, 0 to 1.
   * @example GUI.color.b
   */
  readonly b: number;
  /**
   * White, the default.
   * @example GUI.color = Color.white;
   */
  static readonly white: Color;
  /**
   * Black.
   * @example GUI.color = Color.black;
   */
  static readonly black: Color;
  /**
   * Gray.
   * @example GUI.color = Color.gray;
   */
  static readonly gray: Color;
  /**
   * Red.
   * @example GUI.color = Color.red;
   */
  static readonly red: Color;
  /**
   * Green.
   * @example GUI.color = Color.green;
   */
  static readonly green: Color;
  /**
   * Blue.
   * @example GUI.color = Color.blue;
   */
  static readonly blue: Color;
  /**
   * Yellow.
   * @example GUI.color = Color.yellow;
   */
  static readonly yellow: Color;
  /**
   * Cyan.
   * @example GUI.color = Color.cyan;
   */
  static readonly cyan: Color;
  /**
   * Magenta.
   * @example GUI.color = Color.magenta;
   */
  static readonly magenta: Color;
}

/**
 * Where text sits inside its Rect.
 * @example GUI.skin.label.alignment = TextAnchor.MiddleCenter;
 */
declare enum TextAnchor {
  /**
   * Top left, the default.
   * @example GUI.skin.label.alignment = TextAnchor.UpperLeft;
   */
  UpperLeft,
  /**
   * Top centre.
   * @example GUI.skin.label.alignment = TextAnchor.UpperCenter;
   */
  UpperCenter,
  /**
   * Top right.
   * @example GUI.skin.label.alignment = TextAnchor.UpperRight;
   */
  UpperRight,
  /**
   * Middle left.
   * @example GUI.skin.label.alignment = TextAnchor.MiddleLeft;
   */
  MiddleLeft,
  /**
   * Middle centre.
   * @example GUI.skin.label.alignment = TextAnchor.MiddleCenter;
   */
  MiddleCenter,
  /**
   * Middle right.
   * @example GUI.skin.label.alignment = TextAnchor.MiddleRight;
   */
  MiddleRight,
  /**
   * Bottom left.
   * @example GUI.skin.label.alignment = TextAnchor.LowerLeft;
   */
  LowerLeft,
  /**
   * Bottom centre.
   * @example GUI.skin.label.alignment = TextAnchor.LowerCenter;
   */
  LowerCenter,
  /**
   * Bottom right.
   * @example GUI.skin.label.alignment = TextAnchor.LowerRight;
   */
  LowerRight,
}
