import "../lib/magenta/music";
declare const mm: any;
import { start as startAudio } from "./audio";
import MMLIterator from "mml-iterator";
import { cloneDeep, times } from "./util";
import * as track from "./track";
import * as part from "./part";
import * as soundEffect from "./soundEffect";

export type Track = {
  mml: string;
  sequence;
  soundEffect: soundEffect.SoundEffect;
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
  tracksDiv: HTMLDivElement;
  generatedNotesStepsCount?: number;
};

const timePerStep = 0.125;
const stepsPerQuarter = 4;
let playerCount = 0;

export function get(
  parent: HTMLElement,
  playButtonCallback: () => void
): Player {
  parent.appendChild(document.createElement("hr"));
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
  const tracksDiv = document.createElement("div") as HTMLDivElement;
  tracksDiv.classList.add("row");
  tracksDiv.classList.add("g-2");
  parent.appendChild(tracksDiv);
  const stateTextInput = document.getElementById(
    `state_text_${playerCount}`
  ) as HTMLInputElement;
  document
    .getElementById(`load_${playerCount}`)
    .addEventListener("click", () => {
      stop(player);
      fromMmlStrings(player, JSON.parse(stateTextInput.value));
    });
  document
    .getElementById(`copy_to_clipboard_${playerCount}`)
    .addEventListener("click", () => {
      player.stateTextInput.value = JSON.stringify(toMmlStrings(player));
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
    tracksDiv,
  };
  player.playButton.addEventListener("click", playButtonCallback);
  playerCount++;
  return player;
}

const emptyTrack = {
  mml: "",
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

function insertTrack(player: Player, index: number) {
  const t: Track = cloneDeep(emptyTrack);
  t.soundEffect = soundEffect.getForSequence(
    t.sequence,
    player.tracks[index].soundEffect.isDrum,
    1
  );
  player.tracks.splice(index + 1, 0, t);
  addTrackDiv(player);
  setMmlStrings(
    player,
    player.tracks.map((t) => t.mml)
  );
}

function removeTrack(player: Player, index: number) {
  if (player.tracks.length === 1) {
    return;
  }
  player.tracks.splice(index, 1);
  addTrackDiv(player);
  setMmlStrings(
    player,
    player.tracks.map((t) => t.mml)
  );
}

function addTrackDiv(player: Player) {
  const tracksDiv = document.createElement("div") as HTMLDivElement;
  tracksDiv.classList.add("row");
  tracksDiv.classList.add("g-2");
  times(player.tracks.length, (i) => {
    const canvas = document.createElement("canvas");
    canvas.style.border = "solid";
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("form-control");
    const canvasDiv = document.createElement("div");
    canvasDiv.classList.add("col-md-12");
    canvasDiv.appendChild(canvas);
    tracksDiv.appendChild(canvasDiv);
    const inputDiv = document.createElement("div");
    inputDiv.classList.add("col-md-10");
    inputDiv.appendChild(input);
    tracksDiv.appendChild(inputDiv);
    const addDiv = document.createElement("div");
    addDiv.classList.add("col-md-1");
    const addButton = document.createElement("button");
    addButton.classList.add("btn");
    addButton.classList.add("btn-primary");
    addButton.textContent = "Add";
    addButton.addEventListener("click", () => {
      insertTrack(player, i);
    });
    addDiv.appendChild(addButton);
    tracksDiv.appendChild(addDiv);
    const removeDiv = document.createElement("div");
    removeDiv.classList.add("col-md-1");
    const removeButton = document.createElement("button");
    removeButton.classList.add("btn");
    removeButton.classList.add("btn-primary");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      removeTrack(player, i);
    });
    removeDiv.appendChild(removeButton);
    tracksDiv.appendChild(removeDiv);
    tracksDiv.appendChild(document.createElement("hr"));
    const t = player.tracks[i];
    t.canvas = canvas;
    t.mmlInput = input;
  });
  player.parent.replaceChild(tracksDiv, player.tracksDiv);
  player.tracksDiv = tracksDiv;
}

export function setMmlStrings(player: Player, mmlStrings: string[]) {
  player.tracks.forEach((t, i) => {
    t.mmlInput.value = mmlStrings[i];
  });
  setFromMmlInputs(player);
  setPartsAndVisualizers(player);
}

export function setSequences(player: Player, sequences) {
  player.tracks.forEach((t, i) => {
    setSequence(t, sequences[i]);
  });
  setPartsAndVisualizers(player);
}

export function setTrackSoundEffects(
  player: Player,
  soundEffects: soundEffect.SoundEffect[]
) {
  player.tracks.forEach((t, i) => {
    t.soundEffect = soundEffects[i];
  });
}

export function playStopToggle(player: Player) {
  (player.isPlaying ? stop : play)(player);
}

export function play(player: Player) {
  startAudio();
  if (player.isPlaying) {
    return;
  }
  if (player.tracks == null) {
    return;
  }
  setFromMmlInputs(player);
  setPartsAndVisualizers(player);
  player.isPlaying = true;
  track.init();
  const t = track.get(
    player.tracks.map((t) => t.part),
    player.notesStepsCount
  );
  track.add(t);
  track.play(t, true);
  player.playButton.textContent = "Stop";
}

export function stop(player: Player) {
  if (!player.isPlaying) {
    return;
  }
  player.isPlaying = false;
  track.stopAll();
  player.tracks.forEach((t) => {
    if (t.visualizer != null) {
      t.visualizer.redraw();
    }
  });
  player.playButton.textContent = "Play";
}

export function setFromMmlStrings(player: Player, mmlStrings: string[]) {
  player.tracks.forEach((t, i) => {
    t.mmlInput.value = mmlStrings[i];
  });
  setFromMmlInputs(player);
}

function setFromMmlInputs(player: Player) {
  player.tracks.forEach((t) => {
    t.mml = t.mmlInput.value;
    const { mml, args } = soundEffect.fromMml(t.mml);
    const sequence = createSequence(mml);
    t.soundEffect = soundEffect.getForSequence(
      sequence,
      args.isDrum,
      args.seed,
      args.type,
      args.volume
    );
    setSequence(t, sequence);
  });
}

export function setPartsAndVisualizers(player: Player) {
  player.notesStepsCount =
    player.generatedNotesStepsCount != null
      ? player.generatedNotesStepsCount
      : 0;
  player.tracks.forEach((t) => {
    const stepsCount = calcStepsCount(t.sequence);
    if (stepsCount > player.notesStepsCount) {
      player.notesStepsCount = stepsCount;
    }
  });
  const totalTime = player.notesStepsCount * timePerStep;
  player.tracks.forEach((t) => {
    t.sequence.totalTime = totalTime;
    t.sequence.totalQuantizedSteps = player.notesStepsCount;
    const rgb = t.soundEffect.isDrum ? "150, 150, 150" : "100, 100, 200";
    t.visualizer = getVisualizer(t.sequence, t.canvas, rgb);
  });
  player.tracks.forEach((t) => {
    t.part = part.get(t.mml, t.sequence, t.soundEffect, t.visualizer);
  });
  player.stateTextInput.value = JSON.stringify(toMmlStrings(player));
}

function calcStepsCount(sequence) {
  return sequence.totalQuantizedSteps != null
    ? sequence.totalQuantizedSteps
    : sequence.totalTime / timePerStep;
}

function setSequence(track: Track, sequence) {
  track.sequence = sequence;
  track.mml = track.mmlInput.value = sequenceToMml(sequence, track.soundEffect);
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
    if (ne.type === "end") {
      endTime = ne.time;
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
];

function sequenceToMml(sequence, se: soundEffect.SoundEffect) {
  const notesStepsCount = calcStepsCount(sequence);
  const notes = sequence.notes.map((n) => {
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
    if (n.duration <= 16) {
      durationFreq[n.duration]++;
    }
  }
  if (notesStepsCount != null && prevEndStep < notesStepsCount) {
    notes.push({
      octave: 0,
      note: "r",
      start: prevEndStep,
      duration: notesStepsCount - prevEndStep,
    });
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
  return `${soundEffect.toMml(se)} l${
    durationToNoteLength[baseDuration][0]
  } o${baseOctave} ${notes
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
        let d = n.duration;
        while (d >= 16) {
          s += "1^";
          d -= 16;
        }
        if (d > 0) {
          const dn = durationToNoteLength[d];
          s += `${dn[0]}`;
          if (dn.length === 2) {
            s += `^${dn[1]}`;
          }
        } else {
          s = s.substring(0, s.length - 1);
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

export function toMmlStrings(player: Player) {
  return player.tracks.map((t) => t.mml);
}

export function fromMmlStrings(player: Player, mmlStrings: string[]) {
  setTrackCount(player, mmlStrings.length);
  setMmlStrings(player, mmlStrings);
}
