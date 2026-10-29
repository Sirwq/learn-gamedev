## Hint 1

Respawning is two steps: remember the start once, and go back to it when hurt. Which method runs once?

## Hint 2

In `Start()`: `this.start = this.transform.position;`. Declare the field first with any value, for example `start = new Vector2(0, 0);`.

## Hint 3

Fill in the blanks:

```ts
if (Overlaps(this.gameObject, spikes[i])) {
  this.health = this.health - 1;
  this.transform.position = ___;
  this.velocityY = ___;
}
```
