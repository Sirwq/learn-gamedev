## Hint 1

A Space press in the air disappears before `onGround` becomes true. Keep it briefly in a field.

## Hint 2

Count the field down every frame. The jump condition can use the field instead of `GetKeyDown` directly.

## Hint 3

Reset the field to zero in the branch that sets `velocityY = jumpSpeed`. That prevents one press from jumping twice.
