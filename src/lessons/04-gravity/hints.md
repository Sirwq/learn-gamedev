## Hint 1

Falling means `velocityY` gets more negative every frame, and the box moves down by it. Then the ground has to stop it.

## Hint 2

Your box falls through the ground? After moving, check if `y` went below `40`. If it did, put it back at `40` and stop it falling.

## Hint 3

Fill in the blanks:

```ts
if (this.transform.position.y < 40) {
  this.transform.position = new Vector2(this.transform.position.x, ___);
  this.velocityY = ___;
}
```
