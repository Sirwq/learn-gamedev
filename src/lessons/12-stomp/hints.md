## Hint 1

A stomp and a hurt touch both start with an overlap. What is different is where you are and which way you move.

## Hint 2

Falling means `this.velocityY < 0`. Your feet are at `this.transform.position.y`. The middle of the enemy is `enemy.transform.position.y + enemy.h / 2`.

## Hint 3

Fill in the blanks:

```ts
if (this.velocityY < 0 && Overlaps(this.gameObject, enemy) && ___ > ___) {
  Destroy(enemy);
  this.velocityY = this.jumpSpeed / 2;
}
```
