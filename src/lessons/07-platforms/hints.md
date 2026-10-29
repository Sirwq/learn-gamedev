## Hint 1

You already know how to land on one platform. Now do the same thing for each platform in the list.

## Hint 2

Move your landing `if` inside the `for` loop, and use `platforms[i]` instead of `[0]`.

## Hint 3

Fill in the blanks:

```ts
for (let i = 0; i < ___; i++) {
  const box = platforms[___];
  if (this.velocityY < 0 && Overlaps(this.gameObject, box)) {
```
