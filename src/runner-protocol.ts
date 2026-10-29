// Messages between the page (main.ts) and the Run worker (runner.worker.ts): every one either side may send.
import type { CheckResult } from "./check";
import type { ConsoleLine } from "./console";
import type { Clip, Label } from "./engine";
import type { Project } from "./sandbox";

export type ToWorker =
  /** Starts the Run: a Lesson by index, or a Sandbox Project's Level; `scripts` is transpiled JS by Script name. */
  | ({ type: "start"; canvas: OffscreenCanvas; earned: string[]; scripts: Record<string, string> } & ({ lesson: number } | { level: Project["level"] }))
  | { type: "key"; code: string; down: boolean }
  | { type: "pause" }
  | { type: "resume" };

export type FromWorker =
  /** Once per frame, for the page's hang watchdog. */
  | { type: "tick" }
  | { type: "paused"; paused: boolean }
  | { type: "logs"; lines: ConsoleLine[] }
  | { type: "achievements"; ids: string[] }
  /** The clips played this frame, each once; only in Sandbox and Chapter 2. */
  | { type: "sounds"; names: Clip[] }
  /** This frame's GUI.Label text, sent when it changes; only in Sandbox and Chapter 2. */
  | { type: "labels"; labels: Label[] }
  /** Sent when the result changes. */
  | ({ type: "check" } & CheckResult)
  /** The loop has stopped; `script` and `line` are set when the error points into a Script. */
  | { type: "error"; message: string; script?: string; line?: number; col?: number };
