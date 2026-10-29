## Hint 1

Your box should only move while an arrow key is held, and move left for the left arrow.

## Hint 2

You need two `if`s, one for each key. Moving left is the same as moving right with a negative speed. Remember to click the game before pressing keys.

## Hint 3

Fill in the blanks for the left arrow:

```ts
if (Input.GetKey(KeyCode.___)) {
  this.transform.position = this.transform.position.Add(new Vector2(___ * Time.deltaTime, 0));
}
```
