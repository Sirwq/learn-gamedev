/** Gate Monaco's document formatter on syntax and the current Script version. */
export async function formatCode<Uri>(
  editor: {
    getModel(): { uri: Uri; getVersionId(): number } | null;
    getDomNode(): { hidden: boolean } | null;
    getAction(id: string): { run(): Promise<unknown> } | null;
    focus(): void;
  },
  diagnostics: (uri: Uri) => Promise<readonly { category: number }[]>,
): Promise<"formatted" | "invalid" | "changed" | "unavailable"> {
  const model = editor.getModel();
  if (!model) return "unavailable";
  const version = model.getVersionId();
  const errors = await diagnostics(model.uri);
  if (editor.getModel() !== model || model.getVersionId() !== version || editor.getDomNode()?.hidden) return "changed";
  if (errors.some((error) => error.category === 1)) return "invalid";
  const action = editor.getAction("editor.action.formatDocument");
  if (!action) return "unavailable";
  editor.focus();
  await action.run();
  return "formatted";
}
