// Plays the clips the Run worker queues (workers have no Web Audio), with the saved mute setting.
import { CLIPS, type Clip } from "./engine";

type Store = Pick<Storage, "getItem" | "setItem">;
export const loadMuted = (store: Store) => store.getItem("sound:muted") === "1";
export const saveMuted = (store: Store, muted: boolean) => store.setItem("sound:muted", muted ? "1" : "0");

let ctx: AudioContext | undefined;
const buffers = new Map<Clip, AudioBuffer>();
const playing = new Set<AudioScheduledSourceNode>();

/** Call from the Run click: browsers only start audio from a user gesture. Loads the clips the first time. */
export function unlockAudio() {
  if (!ctx) {
    let c: AudioContext;
    try { c = ctx = new AudioContext(); } catch { return; } // blocked or unavailable audio stays silent
    for (const name of CLIPS)
      fetch(`${import.meta.env.BASE_URL}audio/${name}.mp3`)
        .then((r) => r.arrayBuffer())
        .then((data) => c.decodeAudioData(data))
        .then((buffer) => buffers.set(name, buffer), () => {}); // a clip that fails to load stays silent
  }
  void ctx.resume().catch(() => {});
}

/** Short, quiet two-pitch cue; uses the context unlocked by Run. */
export function playAchievementCue(audio: AudioContext | undefined = ctx) {
  if (!audio || audio.state !== "running") return;
  try {
    const sound = audio.createOscillator();
    const volume = audio.createGain();
    const start = audio.currentTime;
    sound.type = "sine";
    sound.frequency.setValueAtTime(660, start);
    sound.frequency.exponentialRampToValueAtTime(880, start + 0.12);
    volume.gain.setValueAtTime(0.035, start);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    sound.connect(volume);
    volume.connect(audio.destination);
    sound.onended = () => playing.delete(sound);
    playing.add(sound);
    sound.start(start);
    sound.stop(start + 0.25);
  } catch {} // audio permissions or device failure must not interrupt a Run
}

export function playClips(names: Clip[]) {
  for (const name of names) {
    const buffer = buffers.get(name);
    if (!ctx || !buffer) continue;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => playing.delete(source);
    playing.add(source);
    source.start();
  }
}

export function stopSounds() {
  for (const source of playing) source.stop();
  playing.clear();
}
