## Hint 1

Start small: make the enemy walk right, and only then make it turn.

## Hint 2

Flipping the direction is one line: `this.direction = -this.direction;`. Do it inside a loop over `GameObject.FindGameObjectsWithTag("Wall")`, when the enemy and the wall overlap.

## Hint 3

You only need the left-right half of an overlap test, since the enemy never leaves the ground. Fill in the blanks:

```ts
if (x < wall.transform.position.x + ___ && wall.transform.position.x < x + ___) {
  this.direction = -this.direction;
}
```
