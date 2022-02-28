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

export function playMml(mmlStrings: string[], volume: number = 1) {
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
  part.play(parts, notesStepsCount);
}

export function stopMml() {
  part.stop();
}

export function playSoundEffect(
  type: soundEffect.Type = undefined,
  seed: number = undefined,
  count: number = 2,
  volume: number = 1,
  freq: number = undefined
) {
  const key = `${type}_${seed}_${count}_${volume}_${freq}`;
  if (soundEffects[key] == null) {
    const se = soundEffect.get(
      type,
      seed == null ? baseRandomSeed : seed,
      count,
      0.05 * volume,
      freq
    );
    soundEffect.add(se);
    soundEffects[key] = se;
  }
  soundEffect.play(soundEffects[key]);
}

export function update() {
  part.update();
  soundEffect.update();
}

export function init(
  _baseRandomSeed = 1,
  audioContext: AudioContext = undefined
) {
  baseRandomSeed = _baseRandomSeed;
  initAudio(audioContext);
  soundEffect.init();
  soundEffects = {};
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
        endStep,
      });
    }
  }
  return { notes };
}
