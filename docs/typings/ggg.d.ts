declare module ggg {
  // Play music described in MML JSON data
  function playMml(mmlStrings: string[], volume?: number): void;
  // Stop music
  function stopMml(): void;
  // Play the sound effect
  function playSoundEffect(
    type:
      | "coin"
      | "laser"
      | "explosion"
      | "powerUp"
      | "hit"
      | "jump"
      | "select"
      | "synth"
      | "tone"
      | "click"
      | "random",
    seed?: number,
    count?: number,
    volume?: number,
    freq?: number
  ): void;
  // The update function needs to be called every
  // certain amount of time (typically 60 times per second)
  function update(): void;
  // Initialize the library (baseRandomSeed represents
  // the seed of the random number used to generate the sound effect)
  function init(baseRandomSeed?: number, audioContext?: AudioContext): void;
  // The startAudio function needs to be called from within
  // the user operation event handler to enable audio playback in the browser
  function startAudio(): void;
  // Set the tempo of the music
  function setTempo(tempo?: number): void;
  // Set the quantize timing of sound effects by the length of the note
  function setQuantize(noteLength?: number): void;
}
