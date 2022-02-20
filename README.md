# good-old-game-sound-generator ([DEMO](https://abagames.github.io/good-old-game-sound-generator/build/))

Generate sound effects and background music for good old-fashioned mini-games. Powered by [magenta.js](https://magenta.tensorflow.org/) and [jsfx](https://github.com/loov/jsfx).

## How to generate background music

1. Open the [DEMO](https://abagames.github.io/good-old-game-sound-generator/build/) page.

1. (Optional) Input the base music for the generation in [MML (Music Macro Language)](https://github.com/mohayonao/mml-iterator) at the bottom of the screen.

1. Click the 'Generate' button.

## How to use the generated music in your game

1. On the Demo page, click the 'Copy to clipboard' button to copy the MML JSON data to your clipboard.

1. Load `dist/ggg.umd.js`. See a [template html file](https://github.com/abagames/good-old-game-sound-generator/blob/main/docs/samples/_template/index.html) for details.

1. Call the `ggg.playMml` function with the JSON in the clipboard as the first argument.

## Sample game

<a href="https://abagames.github.io/good-old-game-sound-generator/samples/balltour/"><img src="https://abagames.github.io/good-old-game-sound-generator/samples/balltour/screenshot.gif" width="25%" loading="lazy"></a>
<a href="https://abagames.github.io/good-old-game-sound-generator/samples/tlaser/"><img src="https://abagames.github.io/good-old-game-sound-generator/samples/tlaser/screenshot.gif" width="25%" loading="lazy"></a>

## Sample code

[BALL TOUR source code](https://github.com/abagames/good-old-game-sound-generator/blob/main/docs/samples/balltour/main.js)

```javascript
title = "BALL TOUR";
// ... snip ....
options = {
  // Disable the audio feature of `crisp-game-lib`.
  isSoundEnabled: false,
  theme: "dark",
  isReplayEnabled: true,
};

/** @type {{pos: Vector, yAngle: number, vx: number, ticks: number}} */
let player;
/** @type {{pos: Vector, vy: number}[]} */
let spikes;
let nextSpikeDist;
/** @type {Vector[]} */
let balls;
let nextBallDist;
let multiplier;

function update() {
  if (!ticks) {
    init();
    if (!isReplaying) {
      // Play BGM at the start of the game.
      // The 'bgm' variable is assigned the JSON data copied from the clipboard.
      ggg.playMml(bgm);
    }
    player = { pos: vec(90, 50), yAngle: 0, vx: 0, ticks: 0 };
    spikes = [];
    nextSpikeDist = 0;
    balls = [];
    nextBallDist = 9;
    multiplier = 1;
  }
  color("blue");
  rect(0, 90, 99, 9);
  nextSpikeDist -= player.vx;
  if (nextSpikeDist < 0) {
    spikes.push({
      pos: vec(-3, rnd(10, 80)),
      vy: rnd() < 0.2 ? rnds(1, difficulty) * 0.3 : 0,
    });
    nextSpikeDist += rnd(9, 49);
  }
  color("black");
  remove(spikes, (s) => {
    s.pos.x += player.vx;
    s.pos.y += s.vy;
    if (s.pos.y < 10 || s.pos.y > 80) {
      s.vy *= -1;
    }
    if (text("*", s.pos).isColliding.char.d) {
      return true;
    }
    return s.pos.x > 103;
  });
  const py = player.pos.y;
  player.yAngle += difficulty * 0.05;
  player.pos.y = sin(player.yAngle) * 30 + 50;
  player.ticks += clamp((py - player.pos.y) * 9 + 1, 0, 9);
  if (input.isJustPressed) {
    // Play the `select` sound effect.
    ggg.playSoundEffect("select");
  }
  player.vx = (input.isPressed ? 1 : 0.1) * difficulty;
  char(addWithCharCode("a", floor(player.ticks / 50) % 2), player.pos);
  color("red");
  if (char("c", player.pos.x, player.pos.y - 6).isColliding.text["*"]) {
    // Play the `explosion` sound effect.
    ggg.playSoundEffect("explosion");
    gameOver();
  }
  nextBallDist -= player.vx;
  if (nextBallDist < 0) {
    const p = vec(-3, rnd(20, 70));
    color("transparent");
    if (char("c", p).isColliding.text["*"]) {
      nextBallDist += 9;
    } else {
      balls.push(p);
      nextBallDist += rnd(25, 64);
    }
  }
  color("green");
  remove(balls, (b) => {
    b.x += player.vx;
    const c = char("c", b).isColliding.char;
    if (c.a || c.b || c.c) {
      addScore(floor(multiplier), player.pos);
      multiplier += 10;
      // Play the `coin` sound effect.
      ggg.playSoundEffect("coin");
      return true;
    }
    return b.x > 103;
  });
  multiplier = clamp(multiplier - 0.02 * difficulty, 1, 999);
  color("black");
  text(`x${floor(multiplier)}`, 3, 9);
  // The `update` function needs to be called at regular intervals.
  ggg.update();
}

function gameOver() {
  // Stop BGM at the end of the game.
  ggg.stopMml();
  end();
}

function init() {
  // Initialize the library by giving a random number seed for
  // sound effect generation as an argument.
  ggg.init(6);
  ["mousedown", "touchstart", "mouseup", "touchend", "keydown"].forEach((e) => {
    window.addEventListener(e, () => {
      // Calling the `startAudio` function from within the event handler of
      // a user operation will enable audio.
      ggg.startAudio();
    });
  });
}

window.addEventListener("load", init);

// MML JSON data for BGM.
const bgm = {
// ... snip ....
```

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
