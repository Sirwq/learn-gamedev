Walk off a ledge, then press Space a moment later. A small grace period makes that jump feel forgiving. The first drop is safe; the second edge crosses water.

Add a timer field to `Player`. Each frame, check whether your feet are still over the top of a Ground, Platform or Wall box. While supported, refill the timer to `0.1` seconds. Once unsupported, subtract `Time.deltaTime`, stopping at zero. Let a Space press jump while supported or while the timer is positive. Empty the timer when the jump starts so it cannot start a second jump in mid-air.

The old ground clamp at `y = 40` makes gaps act like solid ground. Land only when your feet cross the top of an actual Ground box. Also update `onGround` from support each frame: it must turn false after walking off. Keep the short-hop release from Lesson 18.

**Differs from Unity C#**: Unity projects often use collision callbacks for grounded state. This small engine checks the boxes and tracks the grace timer in `Update()`.
