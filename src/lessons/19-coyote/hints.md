## Hint 1

Watch for the Player's feet leaving a box top without a jump. Keep a short timer for that edge.

## Hint 2

A 0.1 second timer is about six frames here. Refill it while supported; count it down after leaving; clear it on a jump.

## Hint 3

Remove the unconditional `y < 40` ground clamp. Only land when falling onto a real Ground box, and recompute `onGround` from the boxes under your feet before testing Space.
