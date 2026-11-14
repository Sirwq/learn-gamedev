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

### Independent checkpoint: predict and debug

Before changing code, predict what doubling gravity while keeping jumpSpeed unchanged will do to the jump. Test your prediction, then restore the values. Next, imagine the player can jump forever in the air: which state should be cleared when a jump starts? Find and explain that line without loading the reference.

Success: one Space press starts one jump, you cannot start another in mid-air, and landing restores jumping. Explain which change shortened the jump and why. After Lesson 15, Sandbox and six more lessons unlock so you can try these choices in your own level.

<details>
<summary>Optional: Unity C# comparison</summary>

C# writes `bool onGround = false;`. TypeScript calls the type `boolean`, and works it out from `false` for you. `&&` is the same.

</details>
