## Hint 1

Jump near the low wall and tap Space briefly. Hold Space for the tall platform.

## Hint 2

`Input.GetKeyUp(KeyCode.Space)` is true for one frame when Space is released. Check that `this.velocityY > 0` too.

## Hint 3

Before the gravity line, set `this.velocityY = this.velocityY / 2` when both conditions are true.
