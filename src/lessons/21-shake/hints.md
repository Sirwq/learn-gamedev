## Hint 1

The spike hit branch is where the health changes and the Player returns to the start. Start the sound and timer there.

## Hint 2

Count the timer down with `Time.deltaTime`. Use the remaining fraction of `0.3` seconds to make the offset smaller.

## Hint 3

At the end of `Update()`, add a horizontal offset to the Player's `x` when placing the camera. Alternate its sign every frame while the timer is positive; use zero when it ends.
