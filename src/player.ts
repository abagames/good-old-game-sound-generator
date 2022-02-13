import "../lib/magenta/music";
declare const mm: any;
import { start as startAudio } from "./audio";
import MMLIterator from "mml-iterator";
import { cloneDeep, times } from "./util";
import * as part from "./part";
import * as soundEffect from "./soundEffect";

export type Track = {
  mml: string;
  sequence;
  soundEffect: soundEffect.SoundEffect;
  isDrum: boolean;
  part;
  visualizer;
  canvas: HTMLCanvasElement;
  mmlInput: HTMLInputElement;
};

export type Player = {
  tracks: Track[];
  notesStepsCount: number;
  isPlaying: boolean;
  playButton: HTMLButtonElement;
  stateTextInput: HTMLInputElement;
  parent: HTMLElement;
  trackDiv: HTMLDivElement;
};

const timePerStep = 0.125;
const stepsPerQuarter = 4;
let playerCount = 0;

export function get(
  trackCount: number,
  parent: HTMLElement,
  playButtonCallback: () => void
): Player {
  const stateDiv = document.createElement("div");
  stateDiv.classList.add("row");
  stateDiv.classList.add("g-5");
  stateDiv.innerHTML = `
  <div class="col-md-1">
    <button id="play_${playerCount}" class="btn btn-primary" type="button">
      Play
    </button>
  </div>
  <div class="col-md-1">State</div>
  <div class="col-md-6">
    <input id="state_text_${playerCount}" type="text" class="form-control" />
  </div>
  <div class="col-md-1" id="state_buttons">
    <button id="load_${playerCount}" class="btn btn-primary" type="button">
      Load
    </button>
  </div>
  <div class="col-md-2" id="state_buttons">
    <button
      id="copy_to_clipboard_${playerCount}"
      class="btn btn-primary"
      type="button"
    >
      Copy to clipboard
    </button>
  </div>
  `;
  parent.appendChild(stateDiv);
  parent.appendChild(document.createElement("br"));
  const stateTextInput = document.getElementById(
    `state_text_${playerCount}`
  ) as HTMLInputElement;
  document
    .getElementById(`load_${playerCount}`)
    .addEventListener("click", () => {
      stop(player);
      fromJSON(player, JSON.parse(stateTextInput.value));
    });
  document
    .getElementById(`copy_to_clipboard_${playerCount}`)
    .addEventListener("click", () => {
      createParts(player);
      navigator.clipboard.writeText(player.stateTextInput.value);
    });
  const player: Player = {
    tracks: undefined,
    notesStepsCount: 0,
    isPlaying: false,
    playButton: document.getElementById(
      `play_${playerCount}`
    ) as HTMLInputElement,
    stateTextInput,
    parent,
    trackDiv: undefined,
  };
  setTrackCount(player, trackCount);
  player.playButton.addEventListener("click", playButtonCallback);
  playerCount++;
  return player;
}

const emptyTrack = {
  mml: undefined,
  sequence: undefined,
  soundEffect: undefined,
  isDrum: undefined,
  part: undefined,
  visualizer: [],
  canvas: [],
  mmlInput: [],
};

export function setTrackCount(player: Player, trackCount: number) {
  player.tracks = times(trackCount, () => cloneDeep(emptyTrack));
  addTrackDiv(player);
}

function addTrackDiv(player: Player) {
  const tracksDiv = document.createElement("div");
  tracksDiv.classList.add("row");
  tracksDiv.classList.add("g-5");
  times(player.tracks.length, (i) => {
    const canvas = document.createElement("canvas");
    canvas.style.border = "solid";
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("form-control");
    const p = document.createElement("p");
    p.appendChild(canvas);
    p.appendChild(input);
    tracksDiv.appendChild(p);
    const t = player.tracks[i];
    t.canvas = canvas;
    t.mmlInput = input;
  });
  if (player.trackDiv != null) {
    player.parent.replaceChild(tracksDiv, player.trackDiv);
  } else {
    player.parent.appendChild(tracksDiv);
  }
  player.trackDiv = tracksDiv;
}

export function setMmlStrings(player: Player, mmlStrings: string[]) {
  player.tracks.forEach((t, i) => {
    t.mmlInput.value = mmlStrings[i];
  });
  recreateSequence(player);
}

export function setSequences(player: Player, sequences) {
  player.tracks.forEach((t, i) => {
    setSequence(t, sequences[i]);
  });
  setTotalTimeAndVisualizer(player);
}

export function setTrackSounds(
  player: Player,
  trackSounds: { soundEffect: soundEffect.SoundEffect; isDrum: boolean }[]
) {
  player.tracks.forEach((t, i) => {
    const ts = trackSounds[i];
    t.soundEffect = ts.soundEffect;
    t.isDrum = ts.isDrum;
  });
}

export function playStopToggle(player: Player) {
  (player.isPlaying ? stop : play)(player);
}

export async function play(player: Player) {
  await startAudio();
  if (player.isPlaying) {
    return;
  }
  if (!checkMml(player)) {
    return;
  }
  player.isPlaying = true;
  createParts(player);
  part.play();
  player.playButton.textContent = "Stop";
}

function createParts(player: Player) {
  part.init(player.notesStepsCount);
  player.tracks.forEach((t) => {
    t.part = part.add(t.mml, t.sequence, t.soundEffect, t.isDrum, t.visualizer);
  });
  player.stateTextInput.value = JSON.stringify(toJSON(player));
}

export function stop(player: Player) {
  if (!player.isPlaying) {
    return;
  }
  player.isPlaying = false;
  part.stop();
  player.tracks.forEach((t) => {
    if (t.visualizer != null) {
      t.visualizer.redraw();
    }
  });
  player.playButton.textContent = "Play";
}

function recreateSequence(player: Player) {
  player.tracks.forEach((t) => {
    t.mml = t.mmlInput.value;
    setSequence(t, createSequence(t.mml));
  });
  setTotalTimeAndVisualizer(player);
}

function checkMml(player: Player) {
  let isCleared = true;
  player.tracks.forEach((t) => {
    t.mml = t.mmlInput.value;
    setSequence(t, createSequence(t.mml));
    if (t.sequence.totalTime > 0 || t.sequence.totalQuantizedSteps > 0) {
      isCleared = false;
    }
  });
  if (isCleared) {
    player.tracks.forEach((t) => {
      t.mml = undefined;
      t.mmlInput.value = "";
    });
  }
  setTotalTimeAndVisualizer(player);
  return !isCleared;
}

function setTotalTimeAndVisualizer(player: Player) {
  player.notesStepsCount = 0;
  player.tracks.forEach((t) => {
    const stepsCount =
      t.sequence.totalQuantizedSteps != null
        ? t.sequence.totalQuantizedSteps
        : t.sequence.totalTime / timePerStep;
    if (stepsCount > player.notesStepsCount) {
      player.notesStepsCount = stepsCount;
    }
  });
  const totalTime = player.notesStepsCount * timePerStep;
  player.tracks.forEach((t) => {
    t.sequence.totalTime = totalTime;
    t.sequence.totalQuantizedSteps = player.notesStepsCount;
    const rgb = t.isDrum ? "150, 150, 150" : "100, 100, 200";
    t.visualizer = getVisualizer(t.sequence, t.canvas, rgb);
  });
}

function setSequence(track: Track, sequence) {
  track.sequence = sequence;
  track.mml = track.mmlInput.value = sequenceToMml(sequence);
}

function createSequence(mml: string) {
  return mm.sequences.quantizeNoteSequence(mmlToSequence(mml), stepsPerQuarter);
}

function mmlToSequence(mml) {
  let endTime = 0;
  const notes = [];
  const iter = new MMLIterator(mml);
  for (let ne of iter) {
    if (ne.type === "note") {
      endTime = ne.time + ne.duration;
      notes.push({ pitch: ne.noteNumber, startTime: ne.time, endTime });
    }
  }
  return { notes, totalTime: endTime };
}

const durationToNoteLength = [
  [],
  ["16"],
  ["8"],
  ["8."],
  ["4"],
  ["4", "16"],
  ["4."],
  ["4.", "16"],
  ["2"],
  ["2", "16"],
  ["2", "8"],
  ["2", "8."],
  ["2."],
  ["2.", "16"],
  ["2.", "8"],
  ["2.", "8."],
  ["1"],
];

function sequenceToMml(seq) {
  const notes = seq.notes.map((n) => {
    return {
      ...midiNoteNumberToMml(n.pitch),
      start: n.quantizedStartStep,
      duration: n.quantizedEndStep - n.quantizedStartStep,
    };
  });
  const octaveFreq = [];
  const durationFreq = [];
  for (let i = 0; i < 16; i++) {
    octaveFreq.push(0);
    durationFreq.push(0);
  }
  let prevEndStep = 0;
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    if (n.start > prevEndStep) {
      let duration = n.start - prevEndStep;
      if (duration > 16) {
        duration = 16;
      }
      notes.splice(i, 0, {
        octave: 0,
        note: "r",
        start: prevEndStep,
        duration,
      });
      i++;
    }
    prevEndStep = n.start + n.duration;
    octaveFreq[n.octave]++;
    if (n.duration > 16) {
      n.duration = 16;
    }
    durationFreq[n.duration]++;
  }
  let baseOctave = 4;
  let maxOctaveFreq = 0;
  let baseDuration = 2;
  let maxDurationFreq = 0;
  for (let i = 0; i < 16; i++) {
    if (octaveFreq[i] > maxOctaveFreq) {
      maxOctaveFreq = octaveFreq[i];
      baseOctave = i;
    }
    if (durationFreq[i] > maxDurationFreq) {
      maxDurationFreq = durationFreq[i];
      baseDuration = i;
    }
  }
  let octave = baseOctave;
  let nextSpaceDuration = 8;
  return `l${durationToNoteLength[baseDuration][0]} o${baseOctave} ${notes
    .map((n) => {
      let s = "";
      if (n.start >= nextSpaceDuration) {
        s += " ";
        nextSpaceDuration += 8;
      }
      if (n.octave > 0) {
        while (n.octave < octave) {
          s += "<";
          octave--;
        }
        while (n.octave > octave) {
          s += ">";
          octave++;
        }
      }
      s += n.note;
      if (n.duration !== baseDuration) {
        const dn = durationToNoteLength[n.duration];
        s += `${dn[0]}`;
        if (dn.length === 2) {
          s += `^${dn[1]}`;
        }
      }
      return s;
    })
    .join("")}`;
}

const midiNumberToNoteStr = [
  "c",
  "c+",
  "d",
  "d+",
  "e",
  "f",
  "f+",
  "g",
  "g+",
  "a",
  "a+",
  "b",
];

function midiNoteNumberToMml(n: number) {
  let octave = Math.floor(n / 12) - 1;
  if (octave < 1) {
    octave = 1;
  } else if (octave > 8) {
    octave = 8;
  }
  const note = midiNumberToNoteStr[n % 12];
  return { octave, note };
}

function getVisualizer(seq, canvas: HTMLCanvasElement, noteRGB: string) {
  if (seq.totalTime === 0 && seq.totalQuantizedSteps === 0) {
    return;
  }
  return new mm.PianoRollCanvasVisualizer(seq, canvas, {
    noteHeight: 9,
    noteRGB,
    noteSpacing: 1,
    pixelsPerTimeStep: 87,
  });
}

export function toJSON(player: Player) {
  return {
    parts: player.tracks.map((t) => part.toJson(t.part)),
    notesStepsCount: player.notesStepsCount,
  };
}

export function fromJSON(player: Player, json) {
  addTrackDiv(player);
  const parts: part.Part[] = json.parts.map((p) =>
    part.fromJSON(p, mmlToSequence)
  );
  const mmlStrings = parts.map((p) => p.mml);
  setMmlStrings(player, mmlStrings);
  const tracksSounds = parts.map((p) => {
    return {
      soundEffect: p.soundEffect,
      isDrum: p.isDrum,
    };
  });
  setTrackSounds(player, tracksSounds);
  player.notesStepsCount = json.notesStepsCount;
}
