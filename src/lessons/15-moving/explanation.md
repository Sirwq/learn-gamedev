The water is too wide to jump. Ride the moving platform across to the flag. Stand still on it and you should go along; right now it slides out from under you.

The platform has its own Script: open the **MovingPlatform** tab. It already moves back and forth by `step` every frame. Make it carry you: in its `Update()`, find the `"Player"`. If the player is standing on top of the platform, move the player by the same `step` too.

Standing on top means the player's `y` is exactly the platform's top (`y` plus its height, where your landing code puts you), and the two overlap left to right.

**Differs from Unity C#**: in Unity you would often make the player a child of the platform with `transform.SetParent(platform.transform)`, and children move with their parent. Here nothing is a child of anything, so you add the motion yourself.
