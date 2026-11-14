The water is too wide to jump. Ride the moving platform across to the flag. Stand still on it and you should go along; right now it slides out from under you.

The platform has its own Script: open the **MovingPlatform** tab. It already moves back and forth by `step` every frame.

Make it carry you: in its `Update()`, find the `"Player"`. If the player is standing on top of the platform, move the player by the same `step` too.

Standing on top means the player's `y` is exactly the platform's top (`y` plus its height, where your landing code puts you), and the two overlap left to right.

**Try it:** press **Run** and stand still on the moving platform as it carries you across.

### Independent checkpoint: transfer the mechanic

After passing, choose **Start final project** to make a separate Sandbox copy of your current scripts. Rename it, then open **Level**. Build a safe route and a harder shortcut to the same finish, and adapt the moving platform to one route. Predict how changing its speed affects the ride; test the slowest and fastest setting you intend to allow.

Add or change at least one mechanic yourself. Do not copy a full reference solution. Test both routes from a fresh Run, including failure and recovery, and explain why the shortcut is worth its risk. The final-project brief stays in Sandbox. Chapter 2 adds six optional lessons on sound, screen text and game feel.

<details>
<summary>Optional: Unity C# comparison</summary>

in Unity you would often make the player a child of the platform with `transform.SetParent(platform.transform)`, and children move with their parent. Here nothing is a child of anything, so you add the motion yourself.

</details>
