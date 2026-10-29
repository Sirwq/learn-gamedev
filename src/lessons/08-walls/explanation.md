Two grey walls stand in the way, and the flag is on top of the tall one. Walk into a wall now and you go right through it: that loses.

Walls are solid from the side, so stop yourself at their edge. Right after your arrow-key code, loop over every `"Wall"` like you did with the platforms. When you overlap one:

- if you are pressing right, move back so your right side touches its left side: `x` becomes `wall.transform.position.x - this.gameObject.w`;
- `else if` you are pressing left, move so you touch its right side.

```ts
if (Input.GetKey(KeyCode.RightArrow)) {
  ...
} else if (Input.GetKey(KeyCode.LeftArrow)) {
  ...
}
```

`else if` is only checked when the `if` before it was false, so only one of them runs.

You also need to stand on top of walls. Your platform loop can check them too: `.concat(walls)` joins the walls onto the end of the platforms array.

**Differs from Unity C#**: `else if` is the same in C#. Unity stops boxes at walls for you when both have a `Collider2D` and one has a `Rigidbody2D`.
