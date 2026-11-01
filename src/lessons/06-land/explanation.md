The flag floats too high to reach from the ground. Jump onto the crate, then jump again from up there.

First you need to know when two boxes touch. That is a job for a *function*: a named piece of code you can call again and again. Write it above your class:

```ts
function Overlaps(a: GameObject, b: GameObject): boolean {
  const pa = a.transform.position;
  const pb = b.transform.position;
  return pa.x < pb.x + b.w && pb.x < pa.x + a.w && ...;
}
```

`a.w` and `a.h` are a box's width and height. Two boxes overlap when each one starts before the other one ends, left-right **and** bottom-top. Finish the `return` line with the two checks for `y` and `h`.

At the end of `Update()`, get the box with `GameObject.FindGameObjectsWithTag("Box")[0]`.

If the box exists, you are falling (`this.velocityY < 0`), and `Overlaps(this.gameObject, box)`, put yourself on top of it: your `y` becomes `box.transform.position.y + box.h`. Then do what you do on the ground: `velocityY` back to `0`, `onGround` to `true`.

Coming from below, you fly up through the box and land on it on the way down.

**Try it:** press **Run**, land on the box, then jump from it to the flag.

**Differs from Unity C#**: C# puts every function inside a class, as a `static` method, and writes the types first: `static bool Overlaps(GameObject a, GameObject b)`. TypeScript can have a function on its own, and the return type comes after: `): boolean`. Unity finds overlaps for you with a `BoxCollider2D`; here you write the check yourself.
