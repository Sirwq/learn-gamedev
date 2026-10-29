Touch the enemy and you get hurt. Land on its head and you stomp it. Stomp it to pass.

In `Player`, loop over every `"Enemy"`. When you overlap one, it is a stomp only if you are falling **and** your feet are above the middle of the enemy. Compare the positions: your `y` against the enemy's `y` plus half its height. On a stomp, `Destroy` the enemy and bounce up a little by setting `velocityY`.

Anything else is a hurt touch, and the Level already makes you lose for it.

**Differs from Unity C#**: Unity would tell you about the touch in `OnCollisionEnter2D(Collision2D collision)`, and you would compare `collision.contacts` there. Here you check the overlap yourself in `Update()`.
