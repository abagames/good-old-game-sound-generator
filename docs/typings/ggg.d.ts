declare module ggg {
  type MmlData = {
    parts: {
      mml: string;
      soundEffect: {
        type: string;
        params: any;
        volume: number;
      };
      isDrum: boolean;
    }[];
    notesStepsCount: number;
  };

  function playMml(mmlData: MmlData, volume?: number): void;
  function stopMml(): void;
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
  function update(): void;
  function init(baseRandomSeed?: number, audioContext?: AudioContext): void;
  function startAudio(): void;
  function setTempo(tempo?: number): void;
  function setQuantize(noteLength?: number): void;
}
