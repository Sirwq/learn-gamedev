// Only the newest queued save may report success or failure to the UI.
export function saveState(show: (state: "saving" | "saved" | "error") => void) {
  let revision = 0;
  let dirty = false;
  return {
    get dirty() { return dirty; },
    async track(write: Promise<unknown>) {
      const mine = ++revision;
      dirty = true;
      show("saving");
      try {
        await write;
        if (mine === revision) { dirty = false; show("saved"); }
        return true;
      } catch {
        if (mine === revision) show("error");
        return false;
      }
    },
  };
}
