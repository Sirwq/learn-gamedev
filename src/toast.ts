/** A short message that fades out by itself (CSS animation on #toasts > div). */
export function toast(text: string) {
  const t = document.createElement("div");
  t.textContent = text;
  t.onanimationend = () => t.remove();
  document.getElementById("toasts")!.append(t);
  return t;
}

/** Show complete Achievement notices one at a time, without covering Run/Stop. */
export function achievementToast(icon: string, label: string, title: string, message: string) {
  const host = document.getElementById("toasts")!;
  const notice = document.createElement("div");
  notice.className = "achievement";
  notice.innerHTML = '<i class="tile" aria-hidden="true"></i><span><small></small><b></b><span class="achievement-message"></span></span>';
  notice.querySelector("i")!.textContent = icon;
  notice.querySelector("small")!.textContent = label;
  notice.querySelector("b")!.textContent = title;
  notice.querySelector(".achievement-message")!.textContent = message;
  notice.hidden = !!host.querySelector(".achievement");
  notice.addEventListener("animationend", () => {
    notice.remove();
    const next = host.querySelector<HTMLElement>(".achievement[hidden]");
    if (next) next.hidden = false;
  });
  host.append(notice);
  return notice;
}
