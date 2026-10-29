## Hint 1

When you walk into a wall, push yourself back out on the side you came from.

## Hint 2

The wall loop looks like your platform loop, with `"Wall"` as the tag. Put it right after your arrow-key code, before the jump and gravity. To stand on walls too, add `.concat(walls)` after `FindGameObjectsWithTag("Platform")`.

## Hint 3

Fill in the blank for the left arrow: you touch the wall's right side.

```ts
if (Input.GetKey(KeyCode.RightArrow)) {
  this.transform.position = new Vector2(wall.transform.position.x - this.gameObject.w, this.transform.position.y);
} else if (Input.GetKey(KeyCode.LeftArrow)) {
  this.transform.position = new Vector2(___, this.transform.position.y);
}
```
