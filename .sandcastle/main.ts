import { execSync } from "node:child_process";
import { run, claudeCode, type RunOptions, type RunResult } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { limitWaitMs } from "./limit";

// Run with: npm run afk
// Each round: a worker does one ticket, then a reviewer (ponytail-review) checks and fixes its commits.
// Rounds repeat until the worker says COMPLETE or commits nothing.

const shared = {
  // Sandbox provider — runs the agent inside an isolated container.
  sandbox: docker(),

  // The worker's agent; the reviewer overrides it with Sonnet below.
  agent: claudeCode("claude-opus-5-5"),

  // One agent invocation per run, so each finished ticket is merged before a usage
  // limit can fail a run and lose it.
  maxIterations: 1,

  // merge-to-head works on a temporary branch, then merges back to HEAD when the run completes.
  // Required for copyToWorktree.
  branchStrategy: { type: "merge-to-head" },

  // Copy node_modules into the worktree to skip a full install; npm install below is a safety net.
  copyToWorktree: ["node_modules"],

  hooks: { sandbox: { onSandboxReady: [{ command: "npm install" }] } },
} satisfies Partial<RunOptions>;

// Runs once, and after a usage limit sleeps until it resets (+5 min) and relaunches.
// Any other error still stops the script.
async function runPastLimits(options: RunOptions): Promise<RunResult> {
  while (true) {
    let wait: number | null;
    try {
      const result = await run(options);
      // A limit can also end an iteration without an error, so check how the output ends.
      wait = result.completionSignal ? null : limitWaitMs(result.stdout.slice(-500));
      if (wait === null) return result;
    } catch (err) {
      wait = limitWaitMs(String(err));
      if (wait === null) throw err;
    }
    console.log(`Usage limit hit. Relaunching ${options.name} at ${new Date(Date.now() + wait).toLocaleString()}.`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

while (true) {
  const before = execSync("git rev-parse HEAD").toString().trim();

  const work = await runPastLimits({ ...shared, name: "worker", promptFile: "./.sandcastle/prompt.md" });

  if (work.commits.length > 0) {
    await runPastLimits({
      ...shared,
      name: "reviewer",
      agent: claudeCode("claude-sonnet-5-5"),
      promptFile: "./.sandcastle/review-prompt.md",
      promptArgs: { RANGE: `${before}..HEAD` },
    });
  }

  if (work.completionSignal || work.commits.length === 0) break;
}
