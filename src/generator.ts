import "../lib/magenta/music";
import { setRandomFunction } from "../lib/magenta/music";
declare const mm: any;
import * as soundEffect from "./soundEffect";
import { random } from "./random";
import { cloneDeep, pitchToFreq, stableSort, times } from "./util";

const melodyRnn = new mm.MusicRNN(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
);
const drumRnn = new mm.MusicRNN(
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn"
);

export type Track = {
  sequence;
  soundEffect: soundEffect.SoundEffect;
  isDrum: boolean;
};

export function init() {
  setRandomFunction(() => random.get());
}

export async function generate(
  seed: number,
  originSequences,
  rnnRepeatCount = 2,
  rnnTemperature = 0.99,
  isCorrectingDiscordance = false,
  isDrum = false,
  notesStepsCount = 32,
  progressBar: HTMLDivElement = undefined
) {
  if (progressBar != null) {
    progressBar.textContent = "Generating...";
    progressBar.style.width = "10%";
  }
  random.setSeed(seed);
  let rnn;
  if (isDrum) {
    await drumRnn.initialize();
    rnn = drumRnn;
    originSequences.forEach((s) => {
      addDrumFlag(s);
    });
  } else {
    await melodyRnn.initialize();
    rnn = melodyRnn;
  }
  if (progressBar != null) {
    progressBar.style.width = "20%";
  }
  let sequences = originSequences;
  for (let i = 0; i < rnnRepeatCount; i++) {
    const nextSequences = await Promise.all(
      sequences.map((s) =>
        rnn.continueSequence(s, notesStepsCount, rnnTemperature)
      )
    );
    if (progressBar != null) {
      progressBar.style.width = `${((i + 1) / rnnRepeatCount) * 70 + 20}%`;
    }
    for (let j = 0; j < sequences.length; j++) {
      sequences[j] = nextSequences[j];
    }
  }
  const offset = random.getInt(6) * random.getPlusOrMinus();
  sequences.forEach((s) => {
    shiftPitch(s, offset);
  });
  if (isCorrectingDiscordance) {
    for (let i = 1; i < sequences.length; i++) {
      removeDiscordance(sequences[0], sequences[i], notesStepsCount);
    }
  }
  sequences.forEach((s) => {
    addTime(s);
  });
  return sequences;
}

function removeDiscordance(s1, s2, notesSteps: number) {
  const n1 = s1.notes;
  const n2 = s2.notes;
  let p1: number;
  let p2: number;
  let i1 = 0;
  let i2 = 0;
  for (let step = 0; step < notesSteps; step++) {
    if (i1 < n1.length && n1[i1].quantizedEndStep === step) {
      p1 = undefined;
      i1++;
    }
    if (i1 < n1.length && n1[i1].quantizedStartStep === step) {
      p1 = n1[i1].pitch;
    }
    if (i2 < n2.length && n2[i2].quantizedEndStep === step) {
      p2 = undefined;
      i2++;
    }
    if (i2 < n2.length && n2[i2].quantizedStartStep === step) {
      p2 = n2[i2].pitch;
    }
    if (p1 == null || p2 == null) {
      continue;
    }
    const f1 = pitchToFreq(p1);
    const f2 = pitchToFreq(p2);
    let isAccordance = false;
    let targetPitch;
    let minDifference = 9;
    const acceptanceDifference = 2;
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 4; j++) {
        if (isAccordance) {
          break;
        } else if (Math.abs(f1 * i - f2 * j) < acceptanceDifference) {
          isAccordance = true;
        } else {
          for (let k = -3; k < 3; k++) {
            if (
              Math.abs(f1 * i - pitchToFreq(p2 + k) * j) <
                acceptanceDifference &&
              Math.abs(k) < minDifference
            ) {
              targetPitch = p2 + k;
              minDifference = Math.abs(k);
            }
          }
        }
      }
    }
    if (!isAccordance) {
      if (targetPitch == null) {
        n2.splice(i2, 1);
        p2 = undefined;
      } else {
        n2[i2].pitch = targetPitch;
      }
    }
  }
}

function addTime(s) {
  s.notes = s.notes.map((n) => {
    return {
      ...n,
      startTime: n.quantizedStartStep / 8,
      endTime: n.quantizedEndStep / 8,
    };
  });
}

function shiftPitch(s, offset: number) {
  s.notes.forEach((n) => {
    n.pitch += offset;
    if (n.pitch < 0) {
      n.pitch = 0;
    }
  });
}

function addDrumFlag(s) {
  s.notes.forEach((n) => {
    n.isDrum = true;
  });
}

const drumPitches = [
  [36, 35, 27, 28, 31, 32, 33, 34, 37],
  [38, 39, 40, 56, 65, 66, 75, 85],
  [
    42, 44, 54, 68, 69, 70, 71, 73, 78, 80, 45, 29, 41, 61, 64, 84, 48, 47, 60,
    63, 77, 86, 87, 50, 30, 43, 62, 76, 83,
  ],
  [46, 67, 72, 74, 79, 81, 49, 55, 57, 58, 51, 52, 53, 59, 82],
];

export function drumSequencesToPitchSequence(sequences) {
  const ps = cloneDeep(sequences[0]);
  ps.notes = [];
  for (let i = 0; i < sequences.length; i++) {
    sequences[i].notes.forEach((n) => {
      const dp = drumPitches[i];
      n.pitch = dp[0];
      ps.notes.push(n);
    });
  }
  ps.notes = stableSort(ps.notes, (a, b) => a.startTime - b.startTime);
  return ps;
}

export function pitchSequenceToDrumSequences(sequence, trackCount) {
  const dss = times(trackCount, () => {
    const s = cloneDeep(sequence);
    s.notes = [];
    return s;
  });
  sequence.notes.forEach((n) => {
    let ti = -1;
    for (let i = 0; i < drumPitches.length; i++) {
      const dp = drumPitches[i];
      for (let j = 0; j < dp.length; j++) {
        if (dp[j] === n.pitch) {
          ti = i;
          break;
        }
      }
      if (ti >= 0) {
        break;
      }
    }
    let isSameStep = false;
    if (ti >= 0 && ti < trackCount) {
      const s = dss[ti];
      if (s.notes.length > 0) {
        const prevQuantizedStartStep =
          s.notes[s.notes.length - 1].quantizedStartStep;
        if (n.quantizedStartStep === prevQuantizedStartStep) {
          isSameStep = true;
        }
      }
      if (!isSameStep) {
        n.pitch = 60;
        s.notes.push(n);
      }
    }
  });
  return dss;
}
