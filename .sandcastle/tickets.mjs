// Prints the ticket frontier as JSON: open tickets with no assignee and no `## Blocked` note whose blocked_by tickets are all closed.
// A ticket "opens up" for the agent as soon as the last ticket blocking it is closed.
// Usage: node .sandcastle/tickets.mjs [tickets dir]
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function frontier(files) {
  const tickets = Object.entries(files).map(([name, body]) => {
    const fm = body.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    const field = (k) => fm.match(new RegExp(`^${k}:[ \\t]*(.*)$`, "m"))?.[1].trim() ?? "";
    const blockedBy = field("blocked_by").replace(/[[\]]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
    return { id: name.replace(/\.md$/, ""), status: field("status"), assignee: field("assignee"), blockedBy, body };
  });
  const closed = new Set(tickets.filter((t) => t.status === "closed").map((t) => t.id));
  return tickets
    .filter((t) => t.status === "open" && !t.assignee && !/^## Blocked/m.test(t.body) && t.blockedBy.every((b) => closed.has(b)))
    .map(({ id, body }) => ({ id, body }));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2] ?? ".wayfinder/tickets";
  const files = Object.fromEntries(
    readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => [f, readFileSync(join(dir, f), "utf8")]),
  );
  console.log(JSON.stringify(frontier(files), null, 2));
}
