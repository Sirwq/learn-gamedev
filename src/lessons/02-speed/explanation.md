The flag is further away now, and you have only **3 seconds** to reach it. Moving 3 pixels a frame is too slow.

Speed is easier to think about in **pixels per second**. Give `Player` a *field*: a variable that belongs to the Script and keeps its value between frames. Put it above `Update()`:

```ts
speed = 400;
```

Then move by `speed` times `Time.deltaTime`, the seconds since the last frame (1/60):

```ts
this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));
```

400 pixels a second, split over 60 frames, is about 6.7 pixels each frame.

**Try it:** press **Run** and reach the flag before the 3 seconds are up.

**A tool for later**: `Debug.Log` writes a line to the Console under the editor. Add `Debug.Log(this.transform.position);` inside `Update()` to watch the position change, then take it out again.

**Differs from Unity C#**: in C# a field has a type and often `public`: `public float speed = 400f;`. In TypeScript you write `speed = 400;` and TypeScript works out that it is a number. Inside methods you read it as `this.speed`, not `speed`.
