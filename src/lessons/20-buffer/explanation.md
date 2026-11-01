Press Space a little before landing on a step. A buffered jump remembers that press and jumps as soon as your feet touch down. Try the low steps, then reach the flag.

Add a timer field to `Player`. On `Input.GetKeyDown(KeyCode.Space)`, set it to `0.1` seconds. Otherwise count it down using `Time.deltaTime`, stopping at zero.

Start a jump when the timer is positive and you are on the ground (or still within coyote time). Clear the timer when the jump starts, so one press makes one jump.

Keep the short-hop release and support checks from earlier Lessons.

**Try it:** press **Run**, jump toward a low step, then tap Space while falling just before landing on it. The remembered press should launch a new jump as you land. Reach the flag too.

**Differs from Unity C#**: Unity uses the same timing idea, but its input and collision APIs are different. Here `Input.GetKeyDown` records the press and the box checks tell you when you land.
