import { audioContext, playInterval } from "./audio";
import { getQuantizedTime } from "./util";
import * as soundEffect from "./soundEffect";

export type SynthNode = {
  node;
  freq: string;
  duration: string;
  volume: number;
};

export type Part = {
  sequence;
  soundEffect: soundEffect.SoundEffect;
  isDrum: boolean;
  noteIndex: number;
  endStep: number;
  visualizer?;
};

let parts: Part[];
let notesStepsIndex: number;
let notesStepsCount: number;
let nextNotesTime: number;
let noteInterval: number;
let isPlaying = false;

export function init(_notesStepsCount: number) {
  parts = [];
  notesStepsCount = _notesStepsCount;
}

export function add(
  sequence,
  soundEffect: soundEffect.SoundEffect,
  isDrum: boolean,
  visualizer?
) {
  const p: Part = {
    sequence,
    soundEffect,
    isDrum,
    noteIndex: 0,
    endStep: -1,
    visualizer,
  };
  parts.push(p);
  return p;
}

export function remove(tp: Part) {
  parts = parts.filter((p) => p !== tp);
}

export function play() {
  notesStepsIndex = 0;
  noteInterval = playInterval / 2;
  nextNotesTime = getQuantizedTime(audioContext.currentTime) + noteInterval;
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
  if (audioContext.currentTime < nextNotesTime) {
    return;
  }
  nextNotesTime += noteInterval;
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
