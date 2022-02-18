# good-old-game-sound-generator ([DEMO](https://abagames.github.io/good-old-game-sound-generator/build/))

Generate sound effects and background music for good old-fashioned mini-games. Powered by [magenta.js](https://magenta.tensorflow.org/) and [jsfxr](https://github.com/chr15m/jsfxr).

## How to generate background music

1. Open the [DEMO](https://abagames.github.io/good-old-game-sound-generator/build/) page.

1. (Optional) Input the base music for the generation in [MML (Music Macro Language)](https://github.com/mohayonao/mml-iterator) at the bottom of the screen.

1. Click the 'Generate' button.

## How to use the generated music in your game

**Known issue**: Audio playback in Safari has been temporarily disabled because audio cannot be played in Safari in some environments.

1. On the Demo page, click the 'Copy to clipboard' button to copy the MML JSON data to your clipboard.

1. Load `dist/ggg.umd.js`. See a [template html file](https://github.com/abagames/good-old-game-sound-generator/blob/main/docs/samples/_template/index.html) for details.

1. Call the `ggg.playMml` function with the JSON in the clipboard as the first argument.

## Sample game

<a href="https://abagames.github.io/good-old-game-sound-generator/samples/tlaser/"><img src="https://abagames.github.io/good-old-game-sound-generator/samples/tlaser/screenshot.gif" width="25%" loading="lazy"></a>

## Sample code

[T LASER source code](https://github.com/abagames/good-old-game-sound-generator/blob/main/docs/samples/tlaser/main.js)

## Functions

```typescript
// Play music described in MML JSON data
function playMml(mmlData: MmlData, volume?: number): void;
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
// the user operation event handler to enable audio playback in the browser.
function startAudio(): void;
// Set the tempo of the music
function setTempo(tempo?: number): void;
// Set the quantize timing of sound effects by the length of the note
function setQuantize(noteLength?: number): void;
```
