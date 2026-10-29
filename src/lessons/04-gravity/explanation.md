Your box starts up in the air and the flag is on the ground. Make it fall.

Falling is a speed that changes every frame. Add two more fields:

```ts
gravity = 1500;
velocityY = 0;
```

At the end of `Update()`, make `velocityY` a bit more negative each frame, then move by it:

```ts
this.velocityY = this.velocityY - this.gravity * Time.deltaTime;
this.transform.position = this.transform.position.Add(new Vector2(0, this.velocityY * Time.deltaTime));
```

Press **Run**: it falls faster and faster, straight through the ground. The top of the ground is at `y = 40`. Use a comparison: `if (this.transform.position.y < 40)`, put the box back on top with `new Vector2(this.transform.position.x, 40)` and set `velocityY` to `0`.

**Differs from Unity C#**: Unity has a `Rigidbody2D` that adds gravity for you. Here you write it yourself, so you can see how it works. Comparisons (`<`, `>`, `<=`, `>=`) are the same as in C#.
