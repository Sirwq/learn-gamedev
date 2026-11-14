Your player is Null Signal. Your goal is to reach the flag on the right.

**Before you start:** you should know that a variable holds a value and that `=` assigns a value. No game engine experience is needed. Keep `class Player extends MonoBehaviour` and the braces as they are: they connect your code to the player. You do not need to understand classes or inheritance yet.

**1. Watch a small step.** Put this line inside the empty `{ }` after `Update()` in `Player.ts`, then press **Run**:

```ts
this.transform.position = this.transform.position.Add(new Vector2(3, 0));
```

Read it from right to left: `new Vector2(3, 0)` is a step of 3 pixels right and 0 pixels up. `Add` returns the old position plus that step. `=` stores the result in `this.transform.position`, the player's position. `this` means this player.

`Vector2`, its `Add` method, `transform` and `Update()` belong to this course's teaching engine. They are not built-in TypeScript commands. The engine calls `Update()` once per simulation step. Each step advances game time by 1/60 second; the browser controls how often steps run in real time. Repeating a small step makes movement.

**2. Predict before running.** Stop the game. If you replace only `3` with `5`, will the player reach the flag sooner or later? Run it to check your prediction.

**3. Change direction.** Replace that first number with `-3`. Predict the direction, then run. A negative first number moves left; keep the second number at `0` so the player stays at the same height.

**4. Try it yourself.** Without copying another line, make the player move right at twice the original speed. Change only one number. Run to reach the flag, then explain which number sets the horizontal step and what the other number does.

<details>
<summary>Optional: Unity C# comparison</summary>

In C# you would write `transform.position += new Vector2(3, 0);`. This teaching engine uses `this.transform.position` and its own `Vector2.Add` method.

</details>
