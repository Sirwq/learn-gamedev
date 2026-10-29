## Hint 1

A jump is just an upward speed. Gravity already pulls you back down.

## Hint 2

Your box never jumps? Check that `onGround` becomes `true` in the `if` that puts you back on the ground. Your box flies away? Use `GetKeyDown`, not `GetKey`, and set `onGround` to `false` when you jump.

## Hint 3

Fill in the blanks, before the gravity lines:

```ts
if (Input.GetKeyDown(KeyCode.Space) && ___) {
  this.velocityY = ___;
  this.onGround = false;
}
```
