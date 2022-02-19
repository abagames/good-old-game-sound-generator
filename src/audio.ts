export let audioContext: AudioContext;
export let tempo: number;
export let playInterval: number;
export let quantize: number;
let isStarted = false;

export function init(_audioContext: AudioContext = undefined) {
  audioContext =
    _audioContext == null
      ? new (window.AudioContext || (window as any).webkitAudioContext)()
      : _audioContext;
  setTempo();
  setQuantize();
}

export function start() {
  if (isStarted) {
    return;
  }
  isStarted = true;
  playEmptyBuffer();
}

export function setTempo(_tempo: number = 150) {
  tempo = _tempo;
  playInterval = 60 / tempo;
}

export function setQuantize(noteLength: number = 8) {
  quantize = 4 / noteLength;
}

export function getQuantizedTime(time: number) {
  const interval = playInterval * quantize;
  return interval > 0 ? Math.ceil(time / interval) * interval : time;
}

function playEmptyBuffer() {
  const bufferSource = audioContext.createBufferSource();
  bufferSource.start = bufferSource.start || (bufferSource as any).noteOn;
  bufferSource.start();
}
