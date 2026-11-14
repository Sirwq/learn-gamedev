An enemy stands between two walls. Make it patrol: walk until it touches a wall, turn around, walk to the other wall, and so on.

The enemy needs its own behaviour, so it gets its own Script: open the **Enemy** tab. It works like `Player`: a class that extends `MonoBehaviour`, with fields and an `Update()`. `this` now means the enemy.

Give it a `speed` and a `direction` field (`1` for right, `-1` for left). Move it by `speed * direction * Time.deltaTime` every frame.

When it overlaps a `"Wall"`, flip the direction.

Your `Overlaps` function lives in `Player.ts`, and each Script runs on its own, so the enemy can't call it. Compare the positions right in the enemy's code instead.

**Try it:** press **Run** and watch the enemy touch both walls and turn around.

<details>
<summary>Optional: Unity C# comparison</summary>

in Unity you attach a Script to an object in the editor. Here the Level attaches `Enemy.ts` to every enemy for you.

</details>
