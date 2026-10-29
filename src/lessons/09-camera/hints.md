## Hint 1

The camera does not move on its own. Every frame, put it where you are.

## Hint 2

You read your own position with `this.transform.position`. The camera's centre is `Camera.main.transform.position`, and you set it the same way you set yours.

## Hint 3

Fill in the blank with your own `x`:

```ts
Camera.main.transform.position = new Vector2(___, 270);
```
