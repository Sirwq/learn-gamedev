Now show how many coins you have collected. Open the new **HUD** Script. Its `OnGUI()` runs after the game updates each frame, so the text can follow the count immediately.

Find the Player with `GameObject.FindGameObjectsWithTag("Player")`. When it exists, count the coins still in the level and subtract that number from five. Draw the result with `GUI.Label(new Rect(16, 16, 220, 40), "Coins: " + coins);`. The `Rect` starts at the upper left of the screen: its `y` goes down, unlike world positions.

**Differs from Unity C#**: Unity can read another component's fields with `GetComponent`. This small engine has no `GetComponent`, so this HUD derives the collected count from the five coins that started in the level. Unity's `OnGUI` also uses screen coordinates with y going down.
