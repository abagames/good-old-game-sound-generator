import MMLIterator from "mml-iterator";
import * as track from "./track";
import * as part from "./part";
import * as soundEffect from "./soundEffect";
import {
  init as initAudio,
  setTempo,
  setQuantize,
  setVolume,
  playEmpty,
  resumeAudioContext,
  start as startAudio,
} from "./audio";

export {
  setTempo,
  setQuantize,
  setVolume,
  playEmpty,
  resumeAudioContext,
  startAudio,
};

const mmlQuantizeInterval = 0.125;
let baseRandomSeed;
let soundEffects: { [key: string]: soundEffect.SoundEffect };
let mmlTrack: track.Track;

export function playMml(
  mmlStrings: string[],
  volume = 1,
  speed = 1,
  isLooping = true
) {
  let notesStepsCount = 0;
  const tracks = mmlStrings.map((ms) => soundEffect.fromMml(ms));
  tracks.forEach((t) => {
    const s = getNotesStepsCount(t.mml);
    if (s > notesStepsCount) {
      notesStepsCount = s;
    }
  });
  const parts: part.Part[] = tracks.map((t) => {
    const { mml, args } = t;
    const sequence = mmlToQuantizedSequence(mml, notesStepsCount);
    const se = soundEffect.getForSequence(
      sequence,
      args.isDrum,
      args.seed,
      args.type,
      args.volume * volume
    );
    return part.get(mml, sequence, se);
  });
  mmlTrack = track.get(parts, notesStepsCount, speed);
  track.add(mmlTrack);
  track.play(mmlTrack, isLooping);
}

export function stopMml() {
  if (mmlTrack == null) {
    return;
  }
  track.stop(mmlTrack);
  track.remove(mmlTrack);
  mmlTrack = undefined;
}

export function playSoundEffect(
  type: soundEffect.Type = undefined,
  seed: number = undefined,
  numberOfSounds: number = 2,
  volume: number = 1,
  freq: number = undefined
) {
  const key = `${type}_${seed}_${numberOfSounds}_${volume}_${freq}`;
  if (soundEffects[key] == null) {
    const se = soundEffect.get(
      type,
      seed == null ? baseRandomSeed : seed,
      numberOfSounds,
      volume,
      freq
    );
    soundEffect.add(se);
    soundEffects[key] = se;
  }
  soundEffect.play(soundEffects[key]);
}

export function update() {
  track.update();
  soundEffect.update();
}

export function init(
  baseRandomSeed = 1,
  audioContext: AudioContext = undefined
) {
  setSeed(baseRandomSeed);
  initAudio(audioContext);
  reset();
}

export function reset() {
  track.init();
  soundEffect.init();
  soundEffects = {};
  stopMml();
}

export function setSeed(_baseRandomSeed = 1) {
  baseRandomSeed = _baseRandomSeed;
}

function getNotesStepsCount(mml: string) {
  const iter = new MMLIterator(mml);
  for (let ne of iter) {
    if (ne.type === "end") {
      return Math.floor(ne.time / mmlQuantizeInterval);
    }
  }
}

function mmlToQuantizedSequence(mml: string, notesStepsCount: number) {
  const notes = [];
  const iter = new MMLIterator(mml);
  for (let ne of iter) {
    if (ne.type === "note") {
      let endStep = Math.floor(ne.time + ne.duration / mmlQuantizeInterval);
      if (endStep >= notesStepsCount) {
        endStep -= notesStepsCount;
      }
      notes.push({
        pitch: ne.noteNumber,
        quantizedStartStep: Math.floor(ne.time / mmlQuantizeInterval),
        quantizedEndStep: endStep,
      });
    }
  }
  return { notes };
}
