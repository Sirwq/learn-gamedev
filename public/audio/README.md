# Sound clips

- **Pack**: The Essential Retro Video Game Sound Effects Collection [512 sounds] ("512 Sound Effects (8-bit style)"), by Juhani Junkala (SubspaceAudio)
- **Source**: https://opengameart.org/content/512-sound-effects-8-bit-style
- **Licence**: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/
- **Downloaded**: 2026-10-29
- **Licence file**: the pack has no `LICENSE.txt`; its licence statement is in its `INFO.txt`, copied here unchanged as `LICENSE.txt`.

| Name | Original file |
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

Converted with:

```sh
ffmpeg -i X.wav -ac 1 -c:a libmp3lame -b:a 96k X.mp3
```
