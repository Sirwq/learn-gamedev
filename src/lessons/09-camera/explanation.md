This Level is wider than the screen: the flag is far off to the right. Walk out of the camera's view and you lose.

The camera is a game object too, and your Script can read and move it: `Camera.main` is the one camera. `Camera.main.transform.position` is the centre of what you see, and it starts at `(480, 270)`.

At the end of `Update()`, move the camera so its centre is at your `x`. Keep its `y` at `270` so the ground stays put:

```ts
Camera.main.transform.position = new Vector2(___, 270);
```

**Try it:** press **Run** and move right; keep the Player in view all the way to the flag.

<details>
<summary>Optional: Unity C# comparison</summary>

C# writes `Camera.main.transform.position = new Vector3(x, 0, -10);`, because a Unity camera is 3D and needs a `z`. Here positions are always `Vector2`.

</details>
