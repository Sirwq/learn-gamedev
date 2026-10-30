// The 📖 Docs tab, generated from the doc comments in engine-api.d.ts (spec 007), so docs and Monaco hover can't drift.

export type Doc = { id: string; signature: string; text: string; example?: string; unity?: string };
export type Page = { title: string; markdown: string; ids: string[] };

/** Turns a `/** … *\/` block into its text and its `@example` / `@unity` tags. */
function parseDoc(block: string) {
  const flat = block.replace(/^\s*\/\*\*|\*\/\s*$/g, "").split("\n").map((l) => l.replace(/^\s*\*?\s?/, "")).join(" ").trim();
  const [text, ...tags] = flat.split(/\s*@(?=example |unity )/);
  const tag = (name: string) => tags.find((t) => t.startsWith(`${name} `))?.slice(name.length + 1).trim();
  return { text, example: tag("example"), unity: tag("unity") };
}

/** Every class and enum in the typings with its members. Top-level functions and types join the GameObject class (spec 007). */
export function apiClasses(source: string): (Doc & { members: Doc[] })[] {
  const classes: (Doc & { members: Doc[] })[] = [];
  let inside: (typeof classes)[number] | undefined;
  let doc: ReturnType<typeof parseDoc> | undefined;
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("/**")) {
      let block = lines[i];
      while (!block.includes("*/")) block += `\n${lines[++i]}`;
      doc = parseDoc(block);
    } else if (line === "}") inside = undefined;
    else if (line && doc) {
      const signature = line.replace(/^declare /, "").replace(/\s*[{;,]$/, "");
      const kind = signature.match(/^(class|enum) (\w+)/);
      const name = signature.match(/^(?:\w+ )*?(\w+)\??\s*[(:=]|^(\w+)$/)?.slice(1).find(Boolean) ?? "";
      if (kind) classes.push((inside = { id: kind[2], signature, ...doc, members: [] }));
      else if (inside) inside.members.push({ id: `${inside.id}.${name}`, signature: inside.signature.startsWith("enum") ? `${inside.id}.${name}` : signature, ...doc });
      else (classes.find((c) => c.id === "GameObject") ?? classes.at(-1)!).members.push({ id: name, signature, ...doc });
      doc = undefined;
    }
  }
  return classes;
}

export const anchor = (id: string) => `doc-${id}`;
export const docPageAvailable = (title: string, unlocked: boolean) => title !== "Sandbox" || unlocked;

const docMarkdown = (d: Doc) =>
  [
    "```ts\n" + d.signature + "\n```",
    d.text,
    d.example && "Example:\n\n```ts\n" + d.example + "\n```",
    d.unity && `**Differs from Unity C#**: ${d.unity}`,
  ].filter(Boolean).join("\n\n");

/** One page per class, an optional Sandbox guide, then the TypeScript vs Unity C# page. */
export function docPages(source: string, sandboxUnlocked = false): Page[] {
  const classes = apiClasses(source);
  const pages = classes.map((c) => ({
    title: c.id,
    ids: [c.id, ...c.members.map((m) => m.id)],
    markdown: [
      `<h2 id="${anchor(c.id)}">${c.id}</h2>`,
      docMarkdown(c),
      ...c.members.map((m) => `<h3 id="${anchor(m.id)}">${m.id}</h3>\n\n${docMarkdown(m)}`),
    ].join("\n\n"),
  }));
  const differences = classes.flatMap((c) => [c, ...c.members]).filter((d) => d.unity);
  if (sandboxUnlocked) pages.push({
    title: "Sandbox",
    ids: [],
    markdown: [
      "## Sandbox",
      "Build a Project of your own. Start with **Example: Sandbox tour** under + New, then change its Level and Scripts.",
      "### Level editor",
      `Open the 🗺 Level tab to select, move, resize, and add boxes. Give each box a tag and, if it needs code, a Script. A [GameObject](#${anchor("GameObject")}) is the box your Script can find or move.`,
      "### Own sprites",
      `Select a tag in the 🗺 Level tab and set its image. Draw a PNG or JPEG in [Piskel](https://www.piskelapp.com) or [Aseprite](https://www.aseprite.org), then choose it for that tag; the tour's Friend tag has an empty image slot to try. Read [GameObject.tag](#${anchor("GameObject.tag")}) for how tags connect boxes and images.`,
      "### Sound",
      `Call [AudioSource.PlayOneShot](#${anchor("AudioSource.PlayOneShot")}) from a Script. The ten clip names are **Jump, Coin, Hit, Hurt, Shoot, Explosion, Powerup, Win, Lose, Click**. For example, play Jump when the Player jumps and Coin when a coin is collected.`,
      "### Screen text",
      `Draw a counter in [MonoBehaviour.OnGUI](#${anchor("MonoBehaviour.OnGUI")}) with [GUI.Label](#${anchor("GUI.Label")}). Its [Rect](#${anchor("Rect")}) uses screen coordinates: y goes down from the top, unlike the Level's y. The tour's HUD.ts shows a coin counter.`,
      "### Sharing and backups",
      `Share a Project: Export it and send the file. Your friend opens it with + New → From a file…. Their copy has its own Level and Scripts, including its [GameObject](#${anchor("GameObject")}) boxes. For all your work, use 💾 Saves → Export everything to make a backup, and Import everything to restore it.`,
    ].join("\n\n"),
  });
  pages.push({
    title: "TypeScript vs Unity C#",
    ids: [],
    markdown: [
      "## TypeScript vs Unity C#",
      "Everything here works like Unity C#, except:",
      differences.map((d) => `- [${d.id}](#${anchor(d.id)}): ${d.unity}`).join("\n"),
    ].join("\n\n"),
  });
  return pages;
}

/** The Docs member an inline `code` in an Explanation names, e.g. `Update()` → `MonoBehaviour.Update`. */
export function docLink(pages: Page[], code: string): string | undefined {
  const name = code.replace(/^this\./, "").replace(/\(.*$/s, "");
  if (!/^[A-Za-z]\w*(\.\w+)?$/.test(name)) return;
  const ids = pages.flatMap((p) => p.ids);
  if (ids.includes(name)) return name;
  const bare = ids.filter((id) => id.endsWith(`.${name}`));
  return bare.length === 1 ? bare[0] : undefined;
}
