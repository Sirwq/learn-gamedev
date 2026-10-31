/** DeepSeek's chat page, with no query string. */
export const DEEPSEEK_CHAT = "https://chat.deepseek.com/";

/**
 * chat.deepseek.com is served through CloudFront, whose maximum URL length is
 * 8,192 bytes. A longer URL fails before DeepSeek can read `q`, so leave a
 * small margin and use the copy fallback instead.
 * https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html
 */
export const MAX_PREFILL_URL = 8000;

/** RFC 3986 encoding. encodeURIComponent leaves !'()* alone; DeepSeek's own links encode them. */
export const encodePrompt = (prompt: string) =>
  encodeURIComponent(prompt).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

export type DeepSeekHandoff =
  | { kind: "prefill"; url: string }
  | { kind: "manual"; url: string };

/**
 * Build the link DeepSeek's landing page uses. `autosend` is deliberately absent:
 * DeepSeek then keeps the text as a pending intent and puts it in the composer
 * without sending it. `q` alone is enough; the other landing parameters only
 * choose settings.
 */
export const deepSeekHandoff = (prompt: string): DeepSeekHandoff => {
  try {
    const url = `${DEEPSEEK_CHAT}?q=${encodePrompt(prompt)}`;
    return url.length <= MAX_PREFILL_URL ? { kind: "prefill", url } : { kind: "manual", url: DEEPSEEK_CHAT };
  } catch {
    // encodeURIComponent rejects lone surrogates. Keep the full prompt for a manual paste.
    return { kind: "manual", url: DEEPSEEK_CHAT };
  }
};

export type AskDeepSeekResult = "prefilled" | "manual" | "copy-failed" | "popup-blocked";

export type AskDeepSeekOptions = {
  prompt: string;
  /** Write the full prompt to the clipboard. Reject when the browser refuses. */
  copy: (text: string) => Promise<void>;
  /** Open a tab; null means the popup blocker said no. */
  open: (url: string) => Window | null;
  /** Show the full prompt in the manual copy/paste dialog. */
  showFallback: (prompt: string) => void;
};

/**
 * Copy the full prompt first (so a manual fallback always exists), then open
 * DeepSeek. The copy must finish before the new tab takes focus. A failed copy
 * or a blocked popup opens the fallback dialog; nothing is ever auto-sent.
 */
export const askDeepSeek = async ({ prompt, copy, open, showFallback }: AskDeepSeekOptions): Promise<AskDeepSeekResult> => {
  try {
    await copy(prompt);
  } catch {
    showFallback(prompt);
    return "copy-failed";
  }
  const handoff = deepSeekHandoff(prompt);
  let win: Window | null;
  try {
    win = open(handoff.url);
  } catch {
    win = null; // a policy or extension can throw instead of returning null
  }
  if (!win) {
    showFallback(prompt);
    return "popup-blocked";
  }
  return handoff.kind === "prefill" ? "prefilled" : "manual";
};
