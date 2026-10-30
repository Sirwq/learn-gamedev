## Hint 1

Put the label in `OnGUI()`, which runs every frame. A label drawn only in `Start()` will disappear.

## Hint 2

`GameObject.FindGameObjectsWithTag("Coin").length` is the number left. Subtract it from the five coins at the start.

## Hint 3

Check that a Player exists first. Then make a `coins` variable and use it in the supplied `GUI.Label` line. Keep the rect within the 960×540 screen.
