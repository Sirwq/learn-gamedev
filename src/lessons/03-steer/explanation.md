Now there are two flags, one on each side. Touch **both** in the same Run.

Your box needs to move only while a key is held. `if` runs code only when its condition is true, and `Input.GetKey` is true while a key is held down:

```ts
if (Input.GetKey(KeyCode.RightArrow)) {
  this.transform.position = this.transform.position.Add(new Vector2(this.speed * Time.deltaTime, 0));
}
```

Put your moving line inside an `if` like this one. Then add a second `if` for `KeyCode.LeftArrow` that moves by `-this.speed` instead.

Click the game before you press the arrow keys, so it gets the keys and not the editor.

**Try it:** press **Run**, click the game, and steer into both flags.

**Differs from Unity C#**: the same as C#: `if (Input.GetKey(KeyCode.RightArrow)) { ... }`. Only the `this.` before `transform` and `speed` is new.
