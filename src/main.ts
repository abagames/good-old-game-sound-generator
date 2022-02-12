import { init as initAudio } from "./audio";
import * as soundEffect from "./soundEffect";
import * as part from "./part";
import * as player from "./player";
import * as generator from "./generator";
import { cloneDeep, times } from "./util";
import { Random, random } from "./random";

const seedRandom = new Random();
let originPlayer: player.Player;
let generatedPlayer: player.Player;
let soundEffects: { [key: string]: soundEffect.SoundEffect };
let progressBar: HTMLDivElement;

const originNotesStepsCount = 32;
const generatedNotesStepsCount = 64;
const melodyTrackCount = 2;
const drumTrackCount = 4;

function update() {
  requestAnimationFrame(update);
  part.update();
  soundEffect.update();
}

async function generate() {
  player.stop(generatedPlayer);
  player.stop(originPlayer);
  const seed = seedRandom.getInt(999999999);
  console.log(seed);
  const tracks = originPlayer.tracks;
  const sequences = [];
  for (let i = 0; i < melodyTrackCount; i++) {
    if (i >= tracks.length) {
      break;
    }
    sequences.push(cloneDeep(tracks[i].sequence));
  }
  let generatedSequences = await generator.generate(
    seed,
    sequences,
    2,
    0.99,
    true,
    false,
    generatedNotesStepsCount,
    progressBar
  );
  if (originPlayer.tracks.length > melodyTrackCount) {
    const drumSequences = [];
    for (let i = melodyTrackCount; i < tracks.length; i++) {
      drumSequences.push(cloneDeep(tracks[i].sequence));
    }
    let generatedDrumPitchSequences = await generator.generate(
      seed,
      [generator.drumSequencesToPitchSequence(drumSequences)],
      2,
      0.99,
      false,
      true,
      generatedNotesStepsCount,
      progressBar
    );
    const generatedDrumSequences = generator.pitchSequenceToDrumSequences(
      generatedDrumPitchSequences[0],
      originPlayer.tracks.length - 2
    );
    generatedSequences = generatedSequences.concat(generatedDrumSequences);
  }
  player.setTrackSound(
    generatedPlayer,
    generatedSequences.map((s, i) => {
      const isDrum = i > 1;
      let se: soundEffect.SoundEffect;
      if (isDrum) {
        const t = random.select(["hit", "click", "explosion"]);
        se = soundEffect.get(
          t,
          random.getInt(999999999),
          t === "explosion" ? 1 : 2,
          t === "explosion" ? 0.05 : 0.1
        );
      } else {
        const al = calcNoteLengthAverage(s);
        const t =
          random.get() < 1 / al ? "select" : random.select(["synth", "tone"]);
        se = soundEffect.get(
          t,
          random.getInt(999999999),
          t === "tone" ? 1 : 2,
          t === "tone" ? 0.2 : 0.05,
          0.35173364,
          t !== "select" ? 0.1 : 1,
          t !== "select" ? 2 : 1
        );
      }
      return {
        soundEffect: se,
        isDrum,
      };
    })
  );
  player.setSequences(generatedPlayer, generatedSequences);
  progressBar.textContent = "Done.";
  progressBar.style.width = "100%";
  player.play(generatedPlayer);
}

function calcNoteLengthAverage(s) {
  let sl = 0;
  s.notes.forEach((n) => {
    sl += n.quantizedEndStep - n.quantizedStartStep;
  });
  return sl / s.notes.length;
}

function init() {
  initAudio();
  soundEffect.init();
  generator.init();
  generatedPlayer = player.get(
    melodyTrackCount + drumTrackCount,
    generatedNotesStepsCount,
    document.getElementById("generated"),
    () => {
      player.stop(originPlayer);
      player.playStopToggle(generatedPlayer);
    }
  );
  originPlayer = player.get(
    melodyTrackCount + drumTrackCount,
    originNotesStepsCount,
    document.getElementById("origin"),
    () => {
      player.stop(generatedPlayer);
      player.playStopToggle(originPlayer);
    }
  );
  const mmlStrings = [
    "l16 o4 r>c2. r8c r<a+2. r8a+",
    "l16 o4 fc+fg8c8g8 c8fgcfg fcfg8c8f8 c8ffcfg",
    "l16 o4 crrr crrr crrr crrr crrr crrr crrr crrr",
    "l16 o4 rrrr crrr rrrr crrr rrrr crrr rrrr crrr",
    "l16 o4 rcrr rrrc rcrr rrrr rcrr rrrc rcrr rrrr",
    "l16 o4 rrcr rrcr rrcr rrcr rrcr rrcr rrcr rrcr",
  ];
  player.setTrackSound(
    originPlayer,
    times(mmlStrings.length, (i) => {
      const isDrum = i >= melodyTrackCount;
      return {
        soundEffect: isDrum
          ? soundEffect.get("hit", 1, 2, 0.1)
          : soundEffect.get("select", 1, 2, 0.1, 0.35173364),
        isDrum,
      };
    })
  );
  player.setMmlStrings(originPlayer, mmlStrings);
  soundEffects = {};
  soundEffect.types.forEach((t) => {
    soundEffects[t] = soundEffect.get(t, 5);
  });
  document.getElementById("generate").addEventListener("click", () => {
    setTimeout(generate, 0);
  });
  progressBar = document.getElementById("progress_bar") as HTMLDivElement;
  update();
}

window.addEventListener("load", init);
