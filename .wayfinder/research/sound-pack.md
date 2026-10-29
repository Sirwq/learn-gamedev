# Which CC0 sound pack ships with v2?

Researched 2026-10-29. Ticket: [061](../tickets/061-sound-pack.md).

## TL;DR

- **Pick: SubspaceAudio (Juhani Junkala), "512 Sound Effects (8-bit style)"**, also called "The Essential Retro Video Game Sound Effects Collection [512 sounds]". It is **CC0** on the OpenGameArt page and in the pack's own `INFO.txt` / `LICENSE.txt`. It is real NES/C64-style chiptune, so it fits the Pixel Platformer art.
- **One pack covers all ten names.** It has folders for jumps, coins, hits, damage, single shots, explosions, power-ups, fanfares, negative sounds and menu sounds. **No mixing needed.**
- **The pack ships 44.1 kHz 16-bit mono WAV** (20.6 MB zip for 512 sounds). We copy out only ten files: **about 415 KB as WAV, about 60–70 KB as MP3.**
- **Ship MP3** (mono, 96 kbps), made once with ffmpeg and committed to `public/audio/`. Every browser decodes MP3 in `decodeAudioData`. Ogg Vorbis only works in Safari 18.4+ (iOS 18.4+, March 2025); older iPads would get silence.
- **Licence proof**: commit `public/audio/LICENSE.txt` (the pack's own file, copied as is) and a short `public/audio/README.md` (source URL, author, CC0, date, which file became which name).
- **Why the others lose**: Deva's pack has no Win, Lose, Hurt or Click category and asks for credit. Kenney's audio packs are CC0 but none is 8-bit. Covering ten names would mean mixing three or four Kenney packs, and there is still no retro coin or explosion.
- **The mapping below uses real file names.** I read them from a public GitHub mirror of the pack, not from the zip itself. Which variant sounds best (`jump1` or `jump5`, and so on) is a guess. Confirm by ear before committing.

## 1. Candidates

| | SubspaceAudio 512 (8-bit) | Deva 8-Bit Vol. 001 | Kenney audio packs |
|---|---|---|---|
| Licence (source page) | CC0, plus `INFO.txt`: "You can do anything you want with these sounds." | CC0 badge, but the text asks to "credit me as @Shades" | CC0 on every kenney.nl page |
| Style | NES / C64 chiptune | 8-bit | Mostly realistic or UI. Digital Audio is synth "laser/phaser" beeps. Music Jingles has NES jingles |
| Covers the ten names | All ten, several choices each | Coin, Jump, Hit, Shoot, Explosion, Powerup, plus Exit / Error / Talk / Flying. **No Win, Lose, Hurt, Click** | Only by mixing: Digital Audio (Jump, Powerup, Shoot), Impact Sounds (Hit), Interface/UI Audio (Click), Music Jingles (Win, Lose). **No 8-bit coin or explosion** |
| Format | WAV, 44.1 kHz 16-bit mono | WAV (46 files) | OGG |
| Download | 20.6 MB zip (512 files) | 1.2 MB zip | Small zips |
| File list seen | Yes, via a GitHub mirror | No | Digital Audio, via a Godot port (renamed to snake_case) |

- **SubspaceAudio wins**: one CC0 pack, all ten names, one consistent chiptune sound, and clear licence text inside the zip.
- **Deva** is CC0 on OpenGameArt, but it lacks four of our names. Its credit request is not binding under CC0. We would still have to decide whether to honour it, and the rule is no attribution. Its page also says 46 files but lists category counts that add up to 39.
- **Kenney** is the same licence as our art, but its audio is not retro. Mixing 3–4 packs would sound uneven.
- **Licence on other sites**: the 512 pack is a free subset of SubspaceAudio's paid "1000 Retro Sound Effects" on itch.io. Only the 512 files from OpenGameArt are covered by the CC0 there. Do not take files from the paid itch.io packs; their terms were not checked. The OpenGameArt author is "SubspaceAudio", and the pack's `INFO.txt` names Juhani Junkala; both refer to this pack. No site showed the 512 pack under a different licence. One Unity kit mirrors it in a folder called "8BitSounds (Non-Attribution Commercial Use)", with the CC0 `LICENSE.txt` inside.

## 2. File for each name

Paths are inside the pack. They come from a public mirror (atmosgames/SuperSimple2DKit), where the pack's top folder was renamed. Subfolders and file names are the pack's own. The sizes are from that mirror (WAV). Durations are worked out as size ÷ 88.2 KB/s (44.1 kHz, 16-bit, mono).

| Name | File in the pack | WAV size | ≈ length | Alternatives to try by ear |
|---|---|---|---|---|
| Jump | `Movement/Jumping and Landing/sfx_movement_jump1.wav` | 12.3 KB | 0.14 s | `jump5`, `jump10`, `jump15` |
| Coin | `General Sounds/Coins/sfx_coin_single1.wav` | 36.9 KB | 0.42 s | `sfx_coin_single2`–`5` (11–15 KB), `sfx_coin_double1` |
| Hit | `General Sounds/Simple Damage Sounds/sfx_damage_hit1.wav` | 5.3 KB | 0.06 s | `sfx_damage_hit2`–`10` |
| Hurt | `General Sounds/Negative Sounds/sfx_sounds_damage1.wav` | 15.5 KB | 0.18 s | `sfx_sounds_damage2`, `3` |
| Shoot | `Weapons/Single Shot Sounds/sfx_weapon_singleshot1.wav` | 12.5 KB | 0.14 s | `Weapons/Lasers/sfx_wpn_laser1.wav` (32 KB), other `singleshot` |
| Explosion | `Explosions/Short/sfx_exp_short_hard1.wav` | 53.2 KB | 0.60 s | `Explosions/Shortest/sfx_exp_shortest_hard*` (16–68 KB) |
| Powerup | `General Sounds/Positive Sounds/sfx_sounds_powerup1.wav` | 73.9 KB | 0.84 s | `powerup5` (20 KB), `powerup10` (22 KB) |
| Win | `General Sounds/Fanfares/sfx_sounds_fanfare1.wav` | 45.6 KB | 0.52 s | `fanfare2`, `fanfare3` (25 KB) |
| Lose | `General Sounds/Negative Sounds/sfx_sounds_negative1.wav` | 127.8 KB | 1.45 s | `sfx_sounds_negative2` (68 KB), `sfx_sounds_error*` |
| Click | `General Sounds/Menu Sounds/sfx_menu_select1.wav` | 31.2 KB | 0.35 s | `sfx_menu_move1` (3.7 KB), `Simple Bleeps/sfx_sounds_Blip*` |
| **Total** | | **≈ 414 KB** | **≈ 4.7 s** | |

- The **folders and names are certain** (seen in the listing). **Which number in each folder is a guess.** The listing gives names, not sound. Play the candidates and swap the number if another fits better.
- Lose is the least certain. The pack has no "game over" folder; `negative1` is the longest negative sound. If it feels too long, `negative2` or an `error` sound works.
- Check the folder names against the real zip when you download it. The mirror may have dropped or renamed the top folder only.

## 3. Format

- **What the pack ships**: WAV only, 44.1 kHz, 16-bit, mono, at −6 dB (from the pack's `INFO.txt`).
- **What Safari decodes**:
  - MP3, AAC/M4A and WAV: every Safari and iOS Safari we would support, in `<audio>` and in `decodeAudioData`.
  - Ogg Vorbis: Safari and iOS Safari **18.4+** (macOS 15.4 / iOS 18.4, March 2025). Before that, no or partial support. caniuse covers `<audio>` only. I found no source that confirms `decodeAudioData` decodes Ogg on 18.4, so it would need a real test.
  - Ogg Opus: caniuse still marks desktop Safari "partial", even at Safari 27.
- **Ship MP3.** It decodes everywhere, including older iPads on iOS 17. It is ~6× smaller than WAV, and we need only one file per clip, with no fallback list.
- **Convert once, commit the output.** Run it from the folder holding the ten picked WAVs, already renamed to `Jump.wav` and so on:

  ```sh
  for f in *.wav; do ffmpeg -i "$f" -ac 1 -c:a libmp3lame -b:a 96k "${f%.wav}.mp3"; done
  ```

  Commit only the `.mp3` files in `public/audio/` (`Jump.mp3` … `Click.mp3`). The build does not need ffmpeg.
- **MP3 padding**: encoders add a few tens of ms of silence at the start. LAME writes the length in its header, and browsers can skip it, but not every one does. For short one-shots this is rarely heard. If Jump or Click feels late, ship those as WAV. All ten as WAV is still only ~415 KB.
- **Not AAC/M4A**: it decodes everywhere too, but it adds ~46 ms of start padding (2112 samples), and that is not always skipped. No gain over MP3 here.

## 4. Size

| Format | Per clip | Ten clips |
|---|---|---|
| WAV (as shipped) | 5–128 KB | ≈ 414 KB |
| MP3 mono 96 kbps (12 KB/s + ~1 KB header) | ≈ 2–18 KB | **≈ 60–70 KB** |

Both are well under the 1 MB target. Load the ten clips once, with `fetch` + `decodeAudioData`, on the first user gesture (an `AudioContext` must be resumed in a gesture on Safari anyway).

## 5. Licence proof to keep in the repo

- `public/audio/LICENSE.txt`: the pack's own `LICENSE.txt` (or `INFO.txt`), copied unchanged. It names the pack, the author and "CC0".
- `public/audio/README.md`, a few lines:
  - Pack: "512 Sound Effects (8-bit style)" / "The Essential Retro Video Game Sound Effects Collection [512 sounds]"
  - Author: SubspaceAudio (Juhani Junkala)
  - Source: <https://opengameart.org/content/512-sound-effects-8-bit-style>
  - Licence: CC0 1.0, <https://creativecommons.org/publicdomain/zero/1.0/>
  - Downloaded: the date you download it
  - Table: our name → original file, and "converted to MP3 mono 96 kbps with ffmpeg"
- Credit is not required under CC0. A line in the site credits is a kind gesture, same as for Kenney.

Sources:
- OpenGameArt, 512 Sound Effects (8-bit style), SubspaceAudio, CC0: <https://opengameart.org/node/55379>
- Pack licence text (mirror): <https://raw.githubusercontent.com/atmosgames/SuperSimple2DKit/master/Assets/Sounds/FX/8BitSounds%20(Non-Attribution%20Commercial%20Use)/LICENSE.txt>
- Pack file listing (mirror, via GitHub API): <https://github.com/atmosgames/SuperSimple2DKit/tree/master/Assets/Sounds/FX/8BitSounds%20(Non-Attribution%20Commercial%20Use)>
- Pack `INFO.txt` (another mirror): <https://git.uni-greifswald.de/GAIM/gaim/src/branch/main/assets/Sounds/collection1/INFO.txt>
- OpenGameArt, 8-Bit Sound Effect Pack (Vol. 001), Deva, CC0: <https://opengameart.org/node/65676>
- Kenney audio packs (all CC0): <https://kenney.nl/assets/category:Audio>, <https://kenney.nl/assets/digital-audio>, <https://kenney.nl/assets/music-jingles>
- Kenney Digital Audio file list (Godot port): <https://github.com/Boyquotes/kenney-digital-audio-for-godot>
- OpenGameArt, Kenney 63 Digital sound effects (WAV, CC0): <https://opengameart.org/node/12493>
- caniuse, Ogg Vorbis: <https://caniuse.com/ogg-vorbis>; Opus: <https://caniuse.com/opus>
- MacG, Ogg Vorbis added in macOS 15.4 / iOS 18.4 (2026-02): <https://www.macg.co/macos/2026/02/apple-ajoute-le-support-de-logg-vorbis-en-douce-dans-macos-et-ios-avec-une-lecture-native-306585>
- WebKit bug on `<audio>` vs `decodeAudioData` formats: <https://bugs.webkit.org/show_bug.cgi?id=226922>
- oggmented (Ogg decode fallback for older Safari): <https://www.npmjs.com/package/oggmented>
- MDN, decodeAudioData: <https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData>
