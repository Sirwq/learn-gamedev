import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { run, codex, type RunOptions, type RunResult } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { limitWaitMs, preservedWorktree } from "./limit.ts";

// Run with: npm run afk
// Each round: a worker does one ticket, then a reviewer checks and fixes its commits.
// Rounds repeat until no ticket is left on the frontier or the worker commits nothing.

if (!existsSync(".sandcastle/codex-auth/auth.json")) {
  throw new Error("Sign in to ChatGPT for AFK first: npm run afk:login");
}

const afkCodex = () => {
  const agent = codex("gpt-6-sol", {
    sessionStorage: { sandboxSessionsDir: "/home/agent/.afk-codex/sessions" },
  });
  return {
    ...agent,
    // Sandcastle drops Codex's JSON error when stderr contains "Reading prompt from stdin".
    buildPrintCommand: (options: Parameters<typeof agent.buildPrintCommand>[0]) => {
      const print = agent.buildPrintCommand(options);
      return { ...print, command: `${print.command} 2>&1` };
    },
  };
};

const shared = {
  // Sandbox provider — runs the agent inside an isolated container.
  sandbox: docker({
    mounts: [{ hostPath: ".sandcastle/codex-auth", sandboxPath: "/home/agent/.afk-codex" }],
    // Sandcastle's run() passes sandbox env into Docker; its top-level env is ignored here.
    env: { CODEX_HOME: "/home/agent/.afk-codex", CODEX_API_KEY: "", OPENAI_API_KEY: "", CLAUDE_CODE_OAUTH_TOKEN: "" },
  }),

  // The worker and reviewer use the same Codex model.
  agent: afkCodex(),

  // One agent invocation per run, so each finished ticket is merged before a usage
  // limit can fail a run and lose it.
  maxIterations: 1,

  // merge-to-head works on a temporary branch, then merges back to HEAD when the run completes.
  // Required for copyToWorktree.
  branchStrategy: { type: "merge-to-head" },

  // Copy node_modules into the worktree to skip a full install; npm ci below is a safety net.
  copyToWorktree: ["node_modules"],

  // npm ci, not npm install: the sandbox's npm would rewrite package-lock.json and leave every run dirty.
  hooks: { sandbox: { onSandboxReady: [{ command: "npm ci" }] } },
} satisfies Partial<RunOptions>;

// Runs once, and after a usage limit sleeps until it resets (+5 min) and relaunches.
// Transient Docker and Codex connection errors retry; other errors stop the script.
let dockerRetries = 0;
async function runPastLimits(options: RunOptions): Promise<RunResult> {
  let connectionRetries = 0;
  while (true) {
    let wait: number | null;
    try {
      const result = await run(options);
      // A limit can also end an iteration without an error, so check how the output ends.
      wait = result.completionSignal ? null : limitWaitMs(result.stdout.slice(-500));
      if (wait === null) return result;
    } catch (err) {
      // A new run cannot continue edits left in Sandcastle's preserved worktree.
      const preserved = preservedWorktree(err);
      if (preserved) {
        console.error(`Uncommitted work is preserved at ${preserved}. Review and finish it before rerunning AFK.`);
        throw err;
      }
      const message = String(err);
      // Sandcastle reports any failed `docker image inspect` (daemon briefly down) as a missing image.
      const dockerBlip = message.includes("Provider 'docker'") && dockerRetries++ < 10;
      const connectionBlip = message.includes("failed to connect to Responses WebSocket") && connectionRetries++ < 5;
      wait = limitWaitMs(message) ?? (dockerBlip ? 60_000 : connectionBlip ? 30_000 : null);
      if (wait === null) throw err;
    }
    console.log(`Usage limit, Docker error, or Codex connection error. Relaunching ${options.name} at ${new Date(Date.now() + wait).toLocaleString()}.`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

// The worker says COMPLETE after every ticket, so its signal can't end the loop; the frontier can.
const ticketsLeft = () => JSON.parse(execSync("node .sandcastle/tickets.mjs").toString()).length;

while (ticketsLeft() > 0) {
  const before = execSync("git rev-parse HEAD").toString().trim();

  const work = await runPastLimits({ ...shared, name: "worker", promptFile: "./.sandcastle/prompt.md" });

  if (work.commits.length > 0) {
    await runPastLimits({
      ...shared,
      name: "reviewer",
      agent: afkCodex(),
      promptFile: "./.sandcastle/review-prompt.md",
      promptArgs: { RANGE: `${before}..HEAD` },
    });
  }

  // Nothing committed means the worker is stuck; stop instead of looping on the same ticket.
  if (work.commits.length === 0) break;
}
