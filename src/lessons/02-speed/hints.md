## Hint 1

You need to move about twice as fast as before. Try a bigger speed, and measure it in pixels per second.

## Hint 2

The field `speed = 400;` goes inside the class but outside `Update()`. Inside `Update()` you read it as `this.speed`.

## Hint 3

Fill in the blank with the seconds since the last frame:

```ts
this.transform.position = this.transform.position.Add(new Vector2(this.speed * ___, 0));
```
