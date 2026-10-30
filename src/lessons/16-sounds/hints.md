## Hint 1

Listen for both actions. Each sound belongs inside the branch that performs that action, so it plays once per jump or coin.

## Hint 2

The jump branch checks `Input.GetKeyDown(KeyCode.Space) && this.onGround`. Put the Jump line before the gravity update.

## Hint 3

The coin branch calls `Destroy(coins[i])` and increases `this.coins`. Put the Coin line after that increase. Check the capital letters in both clip names.
