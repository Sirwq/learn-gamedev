## Hint 1

Picking up a coin is three steps: notice you touch it, make it go away, count it.

## Hint 2

Loop over `GameObject.FindGameObjectsWithTag("Coin")` like your platform loop. Inside, check `Overlaps(this.gameObject, coin)`. Add a field `coins = 0;` next to `speed`.

## Hint 3

Inside your `if`, fill in the blanks:

```ts
Destroy(___);
this.coins = this.coins + ___;
Debug.Log("coins: " + ___);
```
