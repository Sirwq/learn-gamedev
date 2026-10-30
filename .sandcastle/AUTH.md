# AFK subscription sign-in

Run `npm run afk:login` once, then open the link shown and enter its device code. Device-code sign-in must be enabled in your ChatGPT security settings or workspace settings. The sign-in is saved only in the ignored `.sandcastle/codex-auth/` folder, which Docker mounts for the worker and reviewer. Codex refreshes this session during use.

Run `npm run afk` after sign-in. This uses the ChatGPT subscription and its Codex usage limits. To sign out of this AFK login, run `docker run --rm --user "$(id -u):$(id -g)" -e CODEX_HOME=/home/agent/.afk-codex -v "$PWD/.sandcastle/codex-auth:/home/agent/.afk-codex" --entrypoint codex sandcastle:learn-dev logout`.

The saved sign-in is a credential. Run this only with code and dependencies you trust: the AFK worker can read its mounted auth folder.
