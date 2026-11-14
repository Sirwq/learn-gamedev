This Level is wider than the screen: the flag is far off to the right. Walk out of the camera's view and you lose.

The camera is a game object too, and your Script can read and move it: `Camera.main` is the one camera. `Camera.main.transform.position` is the centre of what you see, and it starts at `(480, 270)`.

At the end of `Update()`, move the camera so its centre is at your `x`. Keep its `y` at `270` so the ground stays put:

```ts
Camera.main.transform.position = new Vector2(___, 270);
```

**Try it:** press **Run** and move right; keep the Player in view all the way to the flag.

### Independent checkpoint: adapt the camera

Predict what happens if the camera follows only half the player's horizontal position. Try it, observe when the player leaves the view, then fix the camera without copying the reference. Choose a small horizontal offset that shows more of the path ahead. Can you reach the flag without losing sight of the player?

Explain why a fixed camera position that worked on a short level fails on this longer scene. Keep a note of the offset you would use for your own Sandbox level.

<details>
<summary>Optional: Unity C# comparison</summary>

C# writes `Camera.main.transform.position = new Vector3(x, 0, -10);`, because a Unity camera is 3D and needs a `z`. Here positions are always `Vector2`.

</details>
