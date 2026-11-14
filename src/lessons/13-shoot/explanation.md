This enemy is far too tall to jump on. Shoot it instead: press **S** to fire a bullet to the right. When no enemy is left, you pass.

A bullet is a new object that doesn't exist when the Level starts. Make one with `Instantiate`: give it a Prefab (a tag, a size, a color and the Script to attach) and where it starts.

In `Player`, when `Input.GetKeyDown(KeyCode.S)`, make a bullet just in front of you:

```ts
Instantiate({ tag: "Bullet", w: 8, h: 4, color: "white", script: "Bullet" }, ___);
```

Then open the **Bullet** tab. Every bullet you make gets its own copy of this Script. Move it right every frame.

When it overlaps an `"Enemy"`, `Destroy` the enemy and the bullet. Also `Destroy` the bullet once it flies out of the camera's view, or it would fly on forever.

**Try it:** press **Run**, fire with S, and remove the enemy.

<details>
<summary>Optional: Unity C# comparison</summary>

Unity's `Instantiate` copies a prefab you built in the editor. Here the Prefab is a plain object you write in code.

</details>
