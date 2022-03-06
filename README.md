# good-old-game-sound-generator ([DEMO](https://abagames.github.io/good-old-game-sound-generator/build/))

Generate sound effects and background music for good old-fashioned mini-games. Powered by [magenta.js](https://magenta.tensorflow.org/) and [jsfx](https://github.com/loov/jsfx).

## How to generate background music

1. Open the [DEMO](https://abagames.github.io/good-old-game-sound-generator/build/) page.

1. (Optional) Input the base music for the generation in [MML (Music Macro Language)](https://github.com/mohayonao/mml-iterator) at the bottom of the screen.

1. Click the 'Generate' button.

## How to use the generated music in your game

1. Import [sounds-some-sounds](https://github.com/abagames/sounds-some-sounds) or [crisp-game-lib](https://github.com/abagames/crisp-game-lib) library.

1. On the Demo page, click the 'Copy to clipboard' button to copy the MML JSON data to your clipboard.

1. Call the `sss.playMml` function with the MML strings in the clipboard as the first argument.

## Sample game

<a href="https://abagames.github.io/crisp-game-lib-games/?balltour"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/balltour/screenshot.gif" width="50%" loading="lazy"></a>
<a href="https://abagames.github.io/crisp-game-lib-games/?tlaser"><img src="https://github.com/abagames/crisp-game-lib-games/raw/main/docs/tlaser/screenshot.gif" width="50%" loading="lazy"></a>

## Sample code

[BALL TOUR source code](https://github.com/abagames/crisp-game-lib-games/blob/main/docs/balltour/main.js) uses [crisp-game-lib](https://github.com/abagames/crisp-game-lib).

```javascript
title = "BALL TOUR";
// ... snip ....
function update() {
  if (!ticks) {
    if (!isReplaying) {
      sss.setTempo(80);
      // Play BGM at the start of the game.
      // The 'bgm' variable is assigned MML string copied from the clipboard.
      sss.playMml(bgm);
    }
// ... snip ....
}

function gameOver() {
  // Stop BGM at the end of the game.
  sss.stopMml();
  end();
}

// MML for BGM.
const bgm = [
  // Specify the tone as `@synth`.
  // `@s308454596`sets the random number seed to generate the tone.
  "@synth@s308454596 v50 l16 o4 r4b4 >c+erer8.<b b2 >c+2 <b2 >c+ec+<ar>c+r<a f+g+af+rf+er e2",
  "@synth@s771118616 v35 l4 o4 f+f+ f+1 >c+ <g+ f+f+ eg+ ab b2",
  "@synth@s848125671 v40 l4 o4 d+16d+16f+16e16e16e16e16<b16 >ee b8.b16r8>f+8 c+c+ <b>f+ <aa a2 bb",
  // Set the drum part with '@d'.
  "@explosion@d@s364411560 v40 l16 o4 cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8.",
  "@explosion@d@s152275772 v40 l16 o4 r8crcrcr8. cccrcr8. crcrcr8. crcrcr8. crcrcr8. crcrcr8. crcrcr8. crcrcr",
  "@hit@d@s234851483 v50 l16 o4 rcr4^16c rcr4. ccr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rcr4.",
];
```
