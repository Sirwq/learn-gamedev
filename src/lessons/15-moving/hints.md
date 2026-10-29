## Hint 1

You are changing another object's position from the platform's Script. Every object's `transform.position` can be set, not only your own.

## Hint 2

`GameObject.FindGameObjectsWithTag("Player")` gives you a list with the player in it. Its position is `players[i].transform.position`.

## Hint 3

Fill in the blanks:

```ts
if (p.y === ___ && p.x < x + this.gameObject.w && x < p.x + players[i].w) {
  players[i].transform.position = p.Add(___);
}
```
