/** A short message that fades out by itself (CSS animation on #toasts > div). */
export function toast(text: string) {
  const t = document.createElement("div");
  t.textContent = text;
  t.onanimationend = () => t.remove();
  document.getElementById("toasts")!.append(t);
  return t;
}
