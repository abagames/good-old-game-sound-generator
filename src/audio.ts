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
  setTempo(150);
  quantize = 0.5;
}

export function start() {
  if (isStarted) {
    return;
  }
  isStarted = true;
  audioContext.resume();
  playEmptyBuffer();
}

export function setTempo(v: number) {
  tempo = v;
  playInterval = 60 / tempo;
}

function playEmptyBuffer() {
  const bufferSource = audioContext.createBufferSource();
  bufferSource.start = bufferSource.start || (bufferSource as any).noteOn;
  bufferSource.connect(audioContext.destination);
  bufferSource.start();
}
