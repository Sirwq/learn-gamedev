## Hint 1

Fix support first: remove the y < 40 clamp, recompute onGround before Space, and land only on actual Ground/Platform/Wall tops approached from above.

## Hint 2

Refill coyote to 0.1 on support; otherwise subtract Time.deltaTime and clamp at zero. Test Space with onGround || coyote > 0, then clear the timer when jumping.

## Hint 3

Show onGround and coyote with OnGUI. Enable Slow practice before Run; game time still advances by 1/60 per step. Compare a supported press, a press two or three steps after leaving, and a press after the timer reaches zero.
