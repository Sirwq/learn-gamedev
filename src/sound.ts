// Plays the clips the Run worker queues (workers have no Web Audio), with the saved mute setting.
import { CLIPS, type Clip } from "./engine";

type Store = Pick<Storage, "getItem" | "setItem">;
export const loadMuted = (store: Store) => store.getItem("sound:muted") === "1";
export const saveMuted = (store: Store, muted: boolean) => store.setItem("sound:muted", muted ? "1" : "0");

let ctx: AudioContext | undefined;
const buffers = new Map<Clip, AudioBuffer>();
const playing = new Set<AudioBufferSourceNode>();

/** Call from the Run click: browsers only start audio from a user gesture. Loads the clips the first time. */
export function unlockAudio() {
  if (!ctx) {
    const c = (ctx = new AudioContext());
    for (const name of CLIPS)
      fetch(`${import.meta.env.BASE_URL}audio/${name}.mp3`)
        .then((r) => r.arrayBuffer())
        .then((data) => c.decodeAudioData(data))
        .then((buffer) => buffers.set(name, buffer), () => {}); // a clip that fails to load stays silent
  }
  void ctx.resume();
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
