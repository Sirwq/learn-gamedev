// Shared by the tests: an in-memory localStorage and a headless Script loader.
import { api, type MonoBehaviour, scriptSource } from "./engine";
import { transpile } from "./run-utils";

/** A fresh, empty stand-in for localStorage, for the `store` parameter of the save / load functions. */
export const memoryStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

/** Headless stand-in for the worker's blob import: evaluate the Script with the student API in scope. */
export const loadScript = (ts: string, name: string) =>
  new Function(...Object.keys(api), scriptSource(transpile(ts), name).replace("export const __script =", "return"))(
    ...Object.values(api),
  ) as new () => MonoBehaviour;
