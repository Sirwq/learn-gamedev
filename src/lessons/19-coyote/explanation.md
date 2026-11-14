Walk off a ledge, then jump a moment later. First fix support and real ground; only then add the grace timer. The first drop is safe; the second gap crosses water.

### 1. Real ground before the timer

The old `y < 40` clamp creates an invisible floor across gaps. Remove that block. Keep your horizontal movement and wall checks. After them, but before testing Space, find the boxes under your feet:

```ts
const ground = GameObject.FindGameObjectsWithTag("Ground");
const supports = GameObject.FindGameObjectsWithTag("Platform").concat(walls, ground);
const feet = this.transform.position;
this.onGround = false;
for (let i = 0; i < supports.length; i++) {
  const box = supports[i];
  const top = box.transform.position.y + box.h;
  if (feet.x < box.transform.position.x + box.w && feet.x + this.gameObject.w > box.transform.position.x
      && Math.abs(feet.y - top) < 2) {
    this.onGround = true;
  }
}
```

`concat` joins lists; `Math.abs` gives distance without a sign. The two x comparisons require horizontal overlap. The y comparison allows less than 2 pixels of rounding tolerance around the top. Reset `onGround` to false before the loop so walking off removes support.

After gravity moves the player, loop through the `ground` list using the same indexed `for` you learned in Lesson 7. Land only if falling, overlapping the box, and `feet.y >= box.transform.position.y + box.h - 2`. Put the player on its top, zero `velocityY`, and set `onGround` true. Add this same old-feet check to your existing Platform/Wall landing loop. `feet` stores the position before vertical movement, so landing requires approaching the top from above.

**Check this first:** keep jumping restricted to `this.onGround`. Run off the first ledge without Space. You must fall, then land on the lower Ground. At the water gap you must fall instead of standing on an invisible floor.

### 2. Remember support briefly

Add `coyote = 0;` beside your other fields. Immediately after the support loop, update it:

```ts
if (this.onGround) {
  this.coyote = 0.1;
} else {
  this.coyote = Math.max(0, this.coyote - Time.deltaTime);
}
```

`Math.max(0, value)` keeps the countdown from going below zero. Allow a new Space press when `this.onGround || this.coyote > 0`. At the start of a jump, clear both `onGround` and `coyote`; one grace period must not allow a second mid-air jump. Keep the short-hop release from Lesson 18.

### 3. See the state and test slowly

Add this method inside Player, next to Update (not inside it). It uses the screen-text API from Lesson 17 to show your actual fields:

```ts
OnGUI() {
  GUI.Label(new Rect(600, 40, 350, 24), "onGround: " + this.onGround);
  GUI.Label(new Rect(600, 66, 350, 24), "coyote: " + this.coyote);
}
```

Tick **Slow practice (next Run)** before starting. Playback waits about 100 ms between steps; each step still advances game time by 1/60 second. Timers, physics and goals use game time, so this changes playback speed only. Stop and Run to restart each experiment.

From the starting position, hold Right toward the first safe ledge. Try these three runs: (1) press Space while `onGround` is true: an ordinary jump, not the edge goal; (2) walk off, wait two or three slow steps, then press while `coyote` is positive: jump and earn the edge goal; (3) walk off and wait until `coyote` reaches zero before pressing: no jump. Stop each run before continuing into the water. Then complete the route to the flag. Untick slow practice and Run to return to normal playback.

In Lesson 20, jump buffering remembers a **press before landing**; coyote time remembers **support after leaving**. Both timers use the same game-time seconds. Slow practice is also available there.

<details>
<summary>Optional: Unity C# comparison</summary>

Unity often uses collision callbacks for support. Here you check actual boxes and maintain the timer in Update.

</details>
