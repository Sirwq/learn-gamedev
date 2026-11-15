// Hold the lock for this document's lifetime; the browser releases it on navigation or close.
export function claimProjectEditor(id: string, locks: LockManager | undefined): Promise<boolean> {
  if (!locks) return Promise.resolve(false);
  return new Promise((resolve) => {
    void locks.request(`project-editor:${id}`, { ifAvailable: true }, (lock) => {
      resolve(lock !== null);
      return lock ? new Promise<void>(() => {}) : undefined;
    }).catch(() => resolve(false));
  });
}
