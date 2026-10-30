Your player is Null Signal. Get it to the red flag.

`Update()` runs once every frame, 60 times a second. Code you put inside it runs again and again, so a small step each frame becomes smooth movement.

Type this line between the `{ }` of `Update()`:

```ts
this.transform.position = this.transform.position.Add(new Vector2(3, 0));
```

`new Vector2(3, 0)` means 3 pixels right, 0 pixels up. `Add` gives back a new position 3 pixels further right, and `=` puts the box there. Then press **Run**.

Try other numbers: what does `5` do? What about `-3`?

**Differs from Unity C#**: in C# you would write `transform.position += new Vector2(3, 0);`. In TypeScript you must write `this.` before `transform`, and vectors use `Add` instead of `+`.
