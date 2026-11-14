## Hint 1

The flag is to the right of your box. Your code has to change the box's position a little, every frame.

## Hint 2

Code inside `Update()` runs once per simulation step. Is your line inside the `{ }` of `Update()`, not above or below it? Did you press **Run** after typing it?

## Hint 3

Fill in the blank so the box moves 3 pixels right each frame:

```ts
this.transform.position = this.transform.position.Add(new Vector2(___, 0));
```
