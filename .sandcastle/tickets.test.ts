import { expect, test } from "vitest";
// @ts-expect-error plain .mjs so it runs in the sandbox with bare node
import { frontier } from "./tickets.mjs";

const t = (status: string, blockedBy = "[]", assignee = "") =>
  `---\ntitle: x\nstatus: ${status}\nblocked_by: ${blockedBy}\nassignee:${assignee}\n---\n\nbody`;

test("only open, unassigned tickets whose blockers are all closed", () => {
  const ids = frontier({
    "001-a.md": t("closed"),
    "002-b.md": t("open", "[001-a]"),
    "003-c.md": t("open", "[002-b]"),
    "004-d.md": t("open", "[001-a, 002-b]"),
    "005-e.md": t("open", "[]", " vivy"),
    "006-f.md": t("open"),
  }).map((x: { id: string }) => x.id);
  expect(ids).toEqual(["002-b", "006-f"]);
});

test("closing a blocker opens the next ticket up", () => {
  const ids = frontier({ "001-a.md": t("closed"), "002-b.md": t("closed", "[001-a]"), "003-c.md": t("open", "[002-b]") })
    .map((x: { id: string }) => x.id);
  expect(ids).toEqual(["003-c"]);
});

test("a ticket with a ## Blocked note leaves the frontier so the loop can stop", () => {
  const ids = frontier({ "001-a.md": t("open") + "\n\n## Blocked\nneeds a browser", "002-b.md": t("open") })
    .map((x: { id: string }) => x.id);
  expect(ids).toEqual(["002-b"]);
});
