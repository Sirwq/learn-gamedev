Run into the spikes once, then jump over them to the flag. On a hit, play `Hurt` and shake the camera briefly so the impact is visible.

Add a shake timer to `Player`. Set it to about `0.3` seconds when spikes take health and play `this.audio.PlayOneShot("Hurt")` there.

Each frame, count the timer down and place `Camera.main` near your Player. Alternate its horizontal offset between positive and negative values, starting near 6 pixels and shrinking toward zero with the timer.

Once the timer ends, centre the camera exactly on the Player again.

**Try it:** press **Run**, touch the spikes once, and watch the camera shake before reaching the flag.

**Differs from Unity C#**: Unity often shakes a camera through an animation or camera component. This small engine uses `Camera.main.transform.position` and `Vector2` directly; the sound clip name must match `Hurt` exactly.
