import { expect, it, vi } from "vitest";
import { claimProjectEditor } from "./project-lock";

it("allows only one editor per project while allowing different projects", async () => {
  const held = new Set<string>();
  const locks = { request: vi.fn((name, options, callback) => {
    expect(options).toEqual({ ifAvailable: true });
    const available = !held.has(name);
    if (available) held.add(name);
    return Promise.resolve(callback(available ? { name } : null));
  }) } as unknown as LockManager;
  expect(await claimProjectEditor("one", locks)).toBe(true);
  expect(await claimProjectEditor("one", locks)).toBe(false);
  expect(await claimProjectEditor("two", locks)).toBe(true);
});

it("refuses unsafe editing when locking is unavailable", async () => {
  expect(await claimProjectEditor("one", undefined)).toBe(false);
});
