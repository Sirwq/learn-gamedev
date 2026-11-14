## Hint 1

Draw each interval from its start to start + size. Both starts must be before the other interval ends. Repeat on y: horizontal overlap alone is not enough.

## Hint 2

The missing comparisons are `pa.y < pb.y + b.h` and `pb.y < pa.y + a.h`. Join all four with `&&`. Put the function above the class; return its boolean result.

## Hint 3

The lookup returns a list. Read its first item with `[0]`, then check `box && this.velocityY < 0 && Overlaps(this.gameObject, box)`. Put this after movement and the ground check.

## Hint 4

Fill in the landing height inside that if:

```ts
this.transform.position = new Vector2(this.transform.position.x, ___);
this.velocityY = 0;
this.onGround = true;
```

The crate top is its y position plus its height.
