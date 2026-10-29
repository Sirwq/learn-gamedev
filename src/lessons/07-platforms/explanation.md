Now there are three platforms, like stairs, and the flag floats above the top one. Your code only lands on the first platform.

`FindGameObjectsWithTag("Platform")` gives back an *array*: a list of every platform. `platforms.length` is how many there are, and `platforms[i]` is the one at place `i`, counting from `0`.

Instead of only `[0]`, check every platform with a `for` loop:

```ts
const platforms = GameObject.FindGameObjectsWithTag("Platform");
for (let i = 0; i < platforms.length; i++) {
  const box = platforms[i];
  // your landing check from the last Lesson
}
```

**Differs from Unity C#**: C# gives you a `GameObject[]` and writes `for (int i = 0; i < platforms.Length; i++)`. TypeScript writes `let` instead of `int`, and `length` with a small `l`.
