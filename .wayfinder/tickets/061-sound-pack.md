---
title: Which CC0 sound pack ships with v2?
label: wayfinder:research
status: closed
blocked_by: [054]
assignee: claude
---

## Question

Sandbox plays shipped clips by fixed name with `this.audio.PlayOneShot("Jump")` ([What do sound and animation add to the engine?](054-sound-animation.md)): `Jump`, `Coin`, `Hit`, `Hurt`, `Shoot`, `Explosion`, `Powerup`, `Win`, `Lose`, `Click`. Which free pack supplies them? Rules: CC0 only (no attribution licences, like the Kenney art), pixel / 8-bit sound that sits with the Pixel Platformer art, short one-shots, small total download. Candidates: Kenney's CC0 sound packs, [SubspaceAudio's 512 Sound Effects (8-bit style)](https://opengameart.org/node/55379), [Deva's 8-Bit Sound Effect Pack Vol. 001](https://opengameart.org/node/65676). Cover: the pick and why, which file maps to each name, file format (OGG / MP3 / WAV, and what Safari plays), total size, and licence proof to keep in the repo.

## Resolution

**SubspaceAudio's "512 Sound Effects (8-bit style)" (Juhani Junkala), CC0, one pack for all ten names, shipped as MP3.**

- **Pick**: the [OpenGameArt pack](https://opengameart.org/node/55379), CC0 on the page and in the pack's own `LICENSE.txt` / `INFO.txt`. NES / C64-style chiptune that sits with the Pixel Platformer art, and it covers all ten names, so no mixing. Only the 512 from OpenGameArt are CC0; never take files from SubspaceAudio's paid itch.io packs.
- **Why not the others**: Deva's Vol. 001 has no Win, Lose, Hurt or Click and asks for credit. Kenney's audio packs are CC0 but none is 8-bit; ten names would need three or four packs and still no retro coin or explosion.
- **Name to file** (file names are real, read from a mirror of the pack; the numbered variant is a first pick, chosen by ear when the clips are added, Lose least certain):

  | Name | File |
  |---|---|
  | Jump | `Movement/Jumping and Landing/sfx_movement_jump1.wav` |
  | Coin | `General Sounds/Coins/sfx_coin_single1.wav` |
  | Hit | `General Sounds/Simple Damage Sounds/sfx_damage_hit1.wav` |
  | Hurt | `General Sounds/Negative Sounds/sfx_sounds_damage1.wav` |
  | Shoot | `Weapons/Single Shot Sounds/sfx_weapon_singleshot1.wav` |
  | Explosion | `Explosions/Short/sfx_exp_short_hard1.wav` |
  | Powerup | `General Sounds/Positive Sounds/sfx_sounds_powerup1.wav` |
  | Win | `General Sounds/Fanfares/sfx_sounds_fanfare1.wav` |
  | Lose | `General Sounds/Negative Sounds/sfx_sounds_negative1.wav` |
  | Click | `General Sounds/Menu Sounds/sfx_menu_select1.wav` |

- **Format**: the pack is 44.1 kHz 16-bit mono WAV. Ship MP3, mono, 96 kbps, converted once (`ffmpeg -i X.wav -ac 1 -c:a libmp3lame -b:a 96k X.mp3`) and committed as `public/audio/Jump.mp3` … `Click.mp3`. Every browser's `decodeAudioData` takes MP3; Ogg Vorbis only works from Safari / iOS 18.4, so older iPads would be silent. If MP3's start padding makes Jump or Click feel late, ship those two as WAV. Not AAC (more padding, no gain).
- **Size**: the ten clips are about 415 KB as WAV, about 60–70 KB as MP3.
- **Licence proof**: `public/audio/LICENSE.txt` (the pack's file, unchanged) and a short `public/audio/README.md`: pack name and author, source URL, CC0 1.0 link, download date, which original file became which name, and the conversion command.

Details and sources: [research/sound-pack.md](../research/sound-pack.md)
