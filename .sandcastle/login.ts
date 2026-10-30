import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const authDir = resolve(".sandcastle/codex-auth");
mkdirSync(authDir, { recursive: true, mode: 0o700 });
chmodSync(authDir, 0o700);

const result = spawnSync("docker", [
  "run", "--rm", "-it",
  "--user", `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
  "-e", "CODEX_HOME=/home/agent/.afk-codex",
  "-v", `${authDir}:/home/agent/.afk-codex`,
  "--entrypoint", "codex", "sandcastle:learn-dev", "login", "--device-auth",
], { stdio: "inherit" });

if (result.error) throw result.error;
process.exit(result.status ?? 1);
