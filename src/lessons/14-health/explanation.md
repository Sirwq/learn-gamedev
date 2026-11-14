Spikes! Touch them and you get hurt: lose 1 health and go back to where you started. Lose all 3 and the game is over. To pass, get hurt once on purpose, then jump over the spikes to the flag.

To go back to the start, you need to remember where the start is. A field like `speed = 400` can't read your position, because the Script isn't attached to its box yet when fields get their values.

`Start()` runs once, after that and before the first `Update()`. Save your position there in a `start` field, and set `health` to `3`.

In `Update()`, find every `"Spikes"`. When you overlap one, take 1 from `health` and log it.

If `health` is now 0, `Destroy(this.gameObject)` and `return`. Otherwise reset: move back to `this.start` and stop falling.

Check spikes after moving. On a hit, reset your position in that same `Update()` so the Level sees you back at the start, not still inside the spikes.

**Try it:** press **Run**, touch the spikes once, then get past them to the flag.

<details>
<summary>Optional: Unity C# comparison</summary>

C# writes `void Start()` and stores the start as a `Vector3`. Unity would often reload the whole scene with `SceneManager.LoadScene` instead of resetting one object.

</details>
