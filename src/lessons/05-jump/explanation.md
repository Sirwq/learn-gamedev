A red enemy stands between you and the flag. Touch it and you lose. Jump over it with **Space**.

A jump is just setting `velocityY` to a positive number: gravity brings you back down. Add two fields:

```ts
jumpSpeed = 600;
onGround = false;
```

`onGround` is a *boolean*: `true` or `false`. Set it to `true` inside your `if` that puts the box back on the ground.

Before the gravity lines, jump only when Space was just pressed **and** you are on the ground. `&&` means "and": both sides must be true.

```ts
if (Input.GetKeyDown(KeyCode.Space) && this.onGround) {
```

Inside, set `this.velocityY` to `this.jumpSpeed` and `this.onGround` to `false`. `GetKeyDown` is true only on the frame the key goes down, so holding Space jumps once.

**Try it:** press **Run** and use Space to jump over the enemy to the flag.

**Differs from Unity C#**: C# writes `bool onGround = false;`. TypeScript calls the type `boolean`, and works it out from `false` for you. `&&` is the same.
