Coins! Touch every coin to pick it up. When none are left, you pass.

Find every `"Coin"` the way you found the platforms.

When you overlap one, remove it from the game with `Destroy(coin)` and add 1 to a `coins` field. Write the count to the Console with `Debug.Log`, so you can see `coins: 1`, `coins: 2`, ….

One coin floats above a platform. Jump up to collect it; walking along the ground will miss it.

**Try it:** press **Run**, collect coins along the way, jump for the high coin, then collect any that remain.

**Differs from Unity C#**: C# writes `Destroy(coin);` too, and `coins++;` works in both languages. Unity games usually show the count on screen; here it goes to the Console.
