A jump feels clearer when it has a sound. A coin can answer with a different sound when you collect it.

Open **Player**. In the jump branch, just after you set `onGround` to `false`, add `this.audio.PlayOneShot("Jump");`.

In the coin branch, just after you increase `this.coins`, add `this.audio.PlayOneShot("Coin");`. The names must have those exact capital letters.

**Try it:** press **Run**, jump onto the platform for the fifth coin, and listen for both sounds.

**Differs from Unity C#**: Unity usually needs an AudioSource component and an AudioClip asset. Here every Script has `this.audio`, and `PlayOneShot` takes one of the built-in clip names as text.
