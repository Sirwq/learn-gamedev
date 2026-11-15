# learn-dev

A desktop browser course for building a 2D platformer in TypeScript. It includes 21 lessons, a code editor, and a Sandbox for independent projects. The app is a static site; no backend or account is required.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite in a desktop browser. To try Sandbox without completing the course, use its dev-only unlock control in the menu.

## Check a change

```sh
npm test
npm run build
```

The build checks TypeScript and produces `dist/`. Tests and builds first generate the standalone game player in `.generated/`; both output directories are ignored by Git. Some lesson tests apply only to specific lessons and are reported as skipped for the others. GitHub Actions runs tests and the build on pull requests and pushes to `main`.

For UI changes, also verify the affected interaction in a desktop browser. Unit tests do not verify the rendered editor or actual browser worker behavior.

## Where things live

- `src/main.ts`: page setup, editor, and lesson interactions.
- `src/menu.ts`: course and project menus, backup/import dialog.
- `src/lessons/`: lesson content, starter code, reference solutions, and goals.
- `src/engine.ts`, `src/runner.worker.ts`, `src/run-frame.ts`: game runtime and lesson checks. Student code runs in a dedicated worker.
- `src/project-storage.ts`, `src/project-file.ts`, `src/backup.ts`: project storage, portable files, and backups.
- `src/game-export.ts`, `src/game-player.ts`: standalone HTML game export.
- `src/i18n.ts`, `src/ru*.ts`: English and Russian text. See `LOCALIZATION.md`.

## Protect student work

Course code and progress live in localStorage. Sandbox projects and images live in IndexedDB after migration; legacy localStorage data is retained. Saves belong to this browser and site origin. Export a backup before clearing browser data or moving to another browser.

Backup import fills missing lesson work and merges progress. Conflicting lesson code stays unchanged unless the student explicitly chooses replacement. One browser tab at a time can edit a given Sandbox project; editing requires Web Locks support.

Keep storage keys and file versions compatible with existing saves. Test import/export, failed writes, and replay behavior when changing persistence. Do not commit browser data, credentials, or generated output.

## Optional AFK tooling

`.sandcastle/` contains the automated ticket runner. It is separate from the shipped app and needs Docker and its own login (`npm run afk:login`). Normal development and CI do not require it. Its startup checks require a clean working tree before `npm run afk`.
