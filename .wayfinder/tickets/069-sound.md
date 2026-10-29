---
title: Sound with this.audio.PlayOneShot
label: build
status: closed
blocked_by: []
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

- **Clips**: ten MP3s in `public/audio/` (`Jump.mp3` … `Click.mp3`) from SubspaceAudio's CC0 "512 Sound Effects (8-bit style)" on OpenGameArt, using the name → file table in the spec, converted with the spec's `ffmpeg` command. Add the pack's `LICENSE.txt` unchanged and a `README.md` (pack, author, source URL, CC0 link, download date, file mapping, command). If the pack can't be downloaded from the sandbox, add a `## Blocked` note saying so instead of using other sounds.
- **API**: an `audio` field on every Script next to `transform`; `this.audio.PlayOneShot(name)` with a fixed string union `Jump | Coin | Hit | Hurt | Shoot | Explosion | Powerup | Win | Lose | Click` that Monaco autocompletes. Doc comment with the @unity note (`GetComponent<AudioSource>().PlayOneShot(clip)`); 📖 Docs picks it up.
- **Path**: the worker queues clip names and sends them with the frame message (a new `FromWorker` member in `src/runner-protocol.ts`). The page plays them with Web Audio; the Run click unlocks the AudioContext. The same clip several times in one frame plays once. Sounds stop on Stop and on pause.
- **Where it sounds**: Sandbox and Chapter 2 Lessons only. Lessons 1–15 stay silent: the call exists but plays nothing there. The engine never plays a sound by itself.
- **Mute**: a 🔊 / 🔇 icon button labelled "Mute sound" on the game view, saved with the localStorage settings, on by default. No keyboard shortcut.

## Spec

- [054-sound-animation.md](054-sound-animation.md)
- [061-sound-pack.md](061-sound-pack.md)
- [062-teaching-v2.md](062-teaching-v2.md)

## Done when

- Tests: `PlayOneShot` queues names per frame with duplicates merged; an unknown name is a Monaco type error; Lessons 1–15 send no sounds; mute is saved.
- The ten files, `LICENSE.txt` and `README.md` are in `public/audio/`.
- `npm run typecheck` and `npm test` pass.

## Resolution

- **Clips**: the ten MP3s in `public/audio/` from the OpenGameArt CC0 pack (downloaded 2026-10-29), first-pick files from the spec table, converted with the spec's `ffmpeg` command (about 65 KB total). The pack ships no `LICENSE.txt`; its CC0 statement is in `INFO.txt`, copied unchanged as `public/audio/LICENSE.txt` and explained in `README.md`. Clips were not picked by ear.
- **API**: `this.audio` (an `AudioSource`) on every `MonoBehaviour`; `PlayOneShot` takes the ten-name string union, so Monaco autocompletes it and flags other names. An unknown name at runtime throws "There is no sound named X". 📖 Docs has a new AudioSource page; both @unity notes reach the C# page.
- **Path**: `engine.ts` queues names in a Set (`takeSounds()` drains it); the worker sends a new `{ type: "sounds" }` `FromWorker` message after each frame, only when `v2Features` (renamed from `animates`) is true, so Lessons 1–15 send nothing. `src/sound.ts` plays them with Web Audio; `run()` unlocks the AudioContext and loads the clips on first Run. Stop, canvas blur (pause) and muting stop playing sounds.
- **Mute**: 🔊 / 🔇 button labelled "Mute sound" (`aria-pressed`) at the top right of the game view, only shown in Sandbox and Chapter 2, saved as `sound:muted` in localStorage. It doesn't take focus, so clicking it doesn't pause the game.

