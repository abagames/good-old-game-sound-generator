import { audioContext, playInterval, getQuantizedTime } from "./audio";
import * as soundEffect from "./soundEffect";

export type Part = {
  mml: string;
  sequence;
  soundEffect: soundEffect.SoundEffect;
  isDrum: boolean;
  noteIndex: number;
  endStep: number;
  visualizer?;
};

export function get(
  mml: string,
  sequence,
  soundEffect: soundEffect.SoundEffect,
  isDrum: boolean,
  visualizer?
): Part {
  return {
    mml,
    sequence,
    soundEffect,
    isDrum,
    noteIndex: 0,
    endStep: -1,
    visualizer,
  };
}

export function toJson(part: Part) {
  return {
    mml: part.mml,
    soundEffect: soundEffect.toJson(part.soundEffect),
    isDrum: part.isDrum,
  };
}

export function fromJSON(json, mmlToSequence: Function): Part {
  return {
    mml: json.mml,
    sequence: mmlToSequence(json.mml, notesStepsCount),
    soundEffect: soundEffect.fromJSON(json.soundEffect),
    isDrum: json.isDrum,
    noteIndex: 0,
    endStep: -1,
  };
}

let parts: Part[];
let notesStepsCount: number;
let notesStepsIndex: number;
let noteInterval: number;
let nextNotesTime: number;
let isPlaying = false;

export function play(_parts: Part[], _notesStepsCount: number) {
  parts = _parts;
  notesStepsCount = _notesStepsCount;
  notesStepsIndex = 0;
  noteInterval = playInterval / 2;
  nextNotesTime = getQuantizedTime(audioContext.currentTime) - noteInterval;
  parts.forEach((p) => {
    p.noteIndex = 0;
  });
  isPlaying = true;
}

export function stop() {
  isPlaying = false;
  parts.forEach((p) => {
    soundEffect.stop(p.soundEffect);
  });
}

export function update() {
  if (!isPlaying) {
    return;
  }
  const currentTime = audioContext.currentTime;
  if (currentTime < nextNotesTime) {
    return;
  }
  nextNotesTime += noteInterval;
  if (nextNotesTime < currentTime) {
    nextNotesTime = getQuantizedTime(currentTime);
  }
  parts.forEach((p) => {
    updatePart(p, nextNotesTime);
  });
  notesStepsIndex++;
  if (notesStepsIndex >= notesStepsCount) {
    notesStepsIndex = 0;
  }
}

function updatePart(p: Part, time: number) {
  const n = p.sequence.notes[p.noteIndex];
  if (n == null) {
    return;
  }
  if (
    (p.soundEffect.type === "synth" || p.soundEffect.type === "tone") &&
    p.endStep === notesStepsIndex
  ) {
    soundEffect.stop(p.soundEffect, time);
  }
  if (n.quantizedStartStep !== notesStepsIndex) {
    return;
  }
  if (p.soundEffect.type === "synth" || p.soundEffect.type === "tone") {
    soundEffect.stop(p.soundEffect);
  }
  if (p.isDrum) {
    soundEffect.playLater(p.soundEffect, time);
  } else {
    soundEffect.playLater(p.soundEffect, time, n.pitch - 69);
  }
  if (p.visualizer != null) {
    p.visualizer.redraw(n);
  }
  p.endStep = n.quantizedEndStep;
  if (p.endStep >= notesStepsCount) {
    p.endStep -= notesStepsCount;
  }
  p.noteIndex++;
  if (p.noteIndex >= p.sequence.notes.length) {
    p.noteIndex = 0;
  }
}
