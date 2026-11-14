// Serializable Level and Run object snapshots, with identity independent of the DOM.
import type { Box, GameObject } from "./engine";

export type ObjectSnapshot = Box & { id: string };

/** Saved Level boxes have stable positions until the Level editor changes them. */
export const startingObjects = (boxes: readonly Box[]): ObjectSnapshot[] =>
  boxes.map((box, index) => ({ ...box, id: `level:${index}` }));

/** One instance per Run: object identity survives movement and duplicate tags. */
export function objectSnapshots() {
  const ids = new WeakMap<GameObject, string>();
  let next = 0;
  return (objects: readonly GameObject[]): ObjectSnapshot[] => objects.map((object) => {
    let id = ids.get(object);
    if (!id) ids.set(object, (id = `run:${++next}`));
    const { x, y } = object.transform.position;
    return { id, tag: object.tag, x, y, w: object.w, h: object.h, color: object.color, script: object.script, ...(object.collider ? { collider: true } : {}) };
  });
}

