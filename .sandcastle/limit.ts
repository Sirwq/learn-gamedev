const EXTRA_MS = 5 * 60_000;
// Fallback when the reset time can't be read: retry in an hour.
const FALLBACK_MS = 60 * 60_000;

/** Sandcastle attaches dirty worktrees to the inner Effect error. */
export function preservedWorktree(err: unknown): string | undefined {
  const cause = err && typeof err === "object"
    ? (err as Record<symbol, unknown>)[Symbol.for("effect/Runtime/FiberFailure/Cause")]
    : undefined;
  const failure = cause && typeof cause === "object" && "error" in cause ? cause.error : err;
  return failure && typeof failure === "object" && "preservedWorktreePath" in failure
    && typeof failure.preservedWorktreePath === "string" ? failure.preservedWorktreePath : undefined;
}

// Returns how long to sleep before retrying, or null if `text` isn't a usage-limit message.
// Handles unix-timestamp and clock-time usage-limit reset messages.
export function limitWaitMs(text: string, now = new Date()): number | null {
  if (!/usage limit|limit reached|hit your limit|limit · resets|rate.?limit/i.test(text)) return null;

  const unix = text.match(/\|(\d{10})\b/);
  if (unix) return Math.max(0, Number(unix[1]) * 1000 - now.getTime()) + EXTRA_MS;

  const reset = text.match(/resets\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?:\s*\(([^)]+)\))?/i);
  if (!reset) return FALLBACK_MS;
  let hour = Number(reset[1]) % 12;
  if (reset[3]?.toLowerCase() === "pm") hour += 12;
  if (!reset[3]) hour = Number(reset[1]);
  const target = hour * 60 + Number(reset[2] ?? 0);

  // shortcut: only the clock time is read, so a multi-day reset ("resets Nov 3, 9am") waits <24h, hits the limit again, and waits again.
  let tz: string | undefined = reset[4];
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { tz = undefined; }
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const nowSecs = get("hour") * 3600 + get("minute") * 60 + get("second");
  const diffSecs = (target * 60 - nowSecs + 86400) % 86400;
  return diffSecs * 1000 + EXTRA_MS;
}
