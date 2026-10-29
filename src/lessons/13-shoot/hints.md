## Hint 1

Do it in two steps. First make the bullet appear when you press S, and watch it sit there. Then make it fly.

## Hint 2

In front of you is your position plus your width: `this.transform.position.Add(new Vector2(this.gameObject.w, 14))`. In `Bullet`, moving right works just like the player: add `speed * Time.deltaTime` to `x`.

## Hint 3

The bullet can't call `Overlaps` from `Player.ts`, so it compares positions itself. Fill in the blanks:

```ts
if (p.x < e.x + enemy.w && e.x < p.x + this.gameObject.w && p.y < ___ && e.y < ___) {
  Destroy(enemy);
  Destroy(this.gameObject);
}
```
