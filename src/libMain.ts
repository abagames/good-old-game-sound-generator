import MMLIterator from "mml-iterator";
import {
  init as initAudio,
  setTempo,
  setQuantize,
  start as startAudio,
} from "./audio";
import * as soundEffect from "./soundEffect";
import * as part from "./part";

export { setTempo, setQuantize, startAudio };

const mmlQuantizeInterval = 0.125;
let baseRandomSeed;
let soundEffects: { [key: string]: soundEffect.SoundEffect };

const isSafari =
  navigator.userAgent.indexOf("Safari") > -1 &&
  navigator.userAgent.indexOf("Chrome") < 0;

export type MmlData = {
  parts: {
    mml: string;
    soundEffect: soundEffect.SoundEffect;
    isDrum: boolean;
  }[];
  notesStepsCount: number;
};

export function playMml(mmlData: MmlData, volume: number = 0.1) {
  if (isSafari) {
    return;
  }
  const parts: part.Part[] = mmlData.parts.map((dp) => {
    const p = part.fromJSON(dp, mmlToQuantizedSequence);
    soundEffect.setVolume(p.soundEffect, (p.soundEffect.volume * volume) / 0.2);
    return part.get(p.mml, p.sequence, p.soundEffect, p.isDrum);
  });
  part.play(parts, mmlData.notesStepsCount);
}

export function stopMml() {
  if (isSafari) {
    return;
  }
  part.stop();
}

export function playSoundEffect(
  type: soundEffect.Type,
  seed: number = undefined,
  count: number = 2,
  volume: number = 0.1,
  freq: number = undefined
) {
  if (isSafari) {
    return;
  }
  const key = `${type}_${seed}_${count}_${volume}_${freq}`;
  if (soundEffects[key] == null) {
    soundEffects[key] = soundEffect.add(
      type,
      seed == null ? baseRandomSeed : seed,
      count,
      volume,
      freq
    );
  }
  soundEffect.play(soundEffects[key]);
}

export function update() {
  if (isSafari) {
    return;
  }
  part.update();
  soundEffect.update();
}

export function init(
  _baseRandomSeed = 1,
  audioContext: AudioContext = undefined
) {
  if (isSafari) {
    return;
  }
  baseRandomSeed = _baseRandomSeed;
  initAudio(audioContext);
  soundEffect.init();
  soundEffects = {};
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
        endStep,
      });
    }
  }
  return { notes };
}
