The flag is too high to reach from the ground. Jump onto the crate, then jump from it to the flag. Work through these small steps; keep your movement and jump code.

### 1. Compare two intervals

A box starts at `x` and ends at `x + w`. Here A spans 10–30:

```text
Overlap:                  No overlap:
A: 10 [--------] 30        A: 10 [--------] 30
B:      20 [--------] 40   B:                 40 [--------] 60
        shared: 20–30                        gap: 30–40
```

There is overlap only if **both** starts are before the other interval's end: `aStart < bEnd && bStart < aEnd`. In the left example: `10 < 40` and `20 < 30` are both true. In the right example, `40 < 30` is false. Edges that only touch (A ends at 30 and B starts at 30) do not overlap because we use `<`, not `<=`.

**Predict:** A spans 10–30 and B spans 15–25. Do they overlap? Check both comparisons before continuing.

### 2. Turn intervals into rectangles

A rectangle must overlap on **both axes**. Its horizontal interval is `x` to `x + w`; its vertical interval is `y` to `y + h`. Here `y` increases upwards. A and B can share horizontal space but still be separate:

```text
       x: 10       30
 y=50     +-------+  B
 y=40     +-------+
          gap
 y=20     +-------+  A
 y=10     +-------+
```

In this example, the horizontal checks pass, but B starts above A's top: `40 < 20` is false. All four checks must pass for rectangles to overlap.

### 3. Give the check a name

A *function* packages a calculation. Its *parameters* are names for the inputs supplied by a caller. For example, `Overlaps(this.gameObject, box)` supplies the player as `a` and the crate as `b`. `: GameObject` says each input is a game object. The final `: boolean` says the answer is `true` or `false`.

`const pa` and `const pb` are local names for the two positions: they exist only inside this function. `return` sends the answer back to the caller. The function checks positions; it does not move either object.

Write this above `class Player`. Complete the two missing vertical comparisons by copying the pattern of the horizontal ones, using `y` and `h`:

```ts
function Overlaps(a: GameObject, b: GameObject): boolean {
  const pa = a.transform.position;
  const pb = b.transform.position;
  return pa.x < pb.x + b.w && pb.x < pa.x + a.w
    && ___ && ___;
}
```

The underscores are placeholders: replace them with comparisons before running. `a.w` and `a.h` mean the object's width and height.

### 4. Find one crate

`GameObject.FindGameObjectsWithTag("Box")` returns an *array*: a list of matching objects. Indices start at zero, so `[0]` reads the first item. With no matches, `[0]` gives `undefined`. This lesson has one crate; the next lesson checks a whole list.

At the end of `Update()`, after movement and the ground check, add:

```ts
const boxes = GameObject.FindGameObjectsWithTag("Box");
const box = boxes[0];
```

Guard with `box && ...` before reading its position. `&&` stops at the first false value, so a missing crate is never passed to `Overlaps`.

### 5. Land using the function

When the crate exists, you are falling (`this.velocityY < 0`), and `Overlaps(this.gameObject, box)` returns true, put the player's bottom at the crate's top: `box.transform.position.y + box.h`. Keep your current `x`. Set `this.velocityY` to `0` and `this.onGround` to `true`, just as when landing on the ground.

Build that `if` after the lookup. Rising through the crate is allowed: this is a simple one-way platform, not a full collision system. Press **Run**, land on the crate, then jump from it to the flag.

**Your variation:** without copying a new solution, make the overlap calculation treat exactly touching edges as overlap. Which comparisons must change? Check the 30-to-30 example, then restore strict overlap for this lesson. Explain why changing only the horizontal checks would treat the two axes differently.

<details>
<summary>Optional: Unity C# comparison</summary>

Unity commonly uses `Collider2D` for collision detection. Here you write the check yourself. A TypeScript function can live outside the class; its return type is written after the parameters, as `): boolean`.

</details>
