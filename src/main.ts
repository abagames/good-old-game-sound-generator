import { init as initAudio } from "./audio";
import * as soundEffect from "./soundEffect";
import * as part from "./part";
import * as player from "./player";
import * as generator from "./generator";
import { cloneDeep } from "./util";
import { Random, random } from "./random";

const seedRandom = new Random();
let originPlayer: player.Player;
let generatedPlayer: player.Player;
let progressBar: HTMLDivElement;
let seedTextInput: HTMLInputElement;
let generatedStepsCountTextInput: HTMLInputElement;

const defaultGeneratedNotesStepsCount = 64;

function update() {
  requestAnimationFrame(update);
  part.update();
  soundEffect.update();
}

async function generate(seed: number) {
  player.stop(generatedPlayer);
  player.stop(originPlayer);
  let generatedNotesStepsCount = Number.parseInt(
    generatedStepsCountTextInput.value
  );
  if (
    Number.isNaN(generatedNotesStepsCount) ||
    generatedNotesStepsCount < 4 ||
    generatedNotesStepsCount > 256
  ) {
    generatedNotesStepsCount = defaultGeneratedNotesStepsCount;
    generatedStepsCountTextInput.value = `${generatedNotesStepsCount}`;
  }
  const tracks = originPlayer.tracks;
  const melodySequences = [];
  const drumSequences = [];
  let tmpDrumSequences = [];
  const drumTrackCounts = [];
  tracks.forEach((t) => {
    if (t.isDrum) {
      tmpDrumSequences.push(cloneDeep(t.sequence));
      if (tmpDrumSequences.length === 4) {
        drumSequences.push(
          generator.drumSequencesToPitchSequence(tmpDrumSequences)
        );
        drumTrackCounts.push(4);
        tmpDrumSequences = [];
      }
    } else {
      melodySequences.push(cloneDeep(t.sequence));
    }
  });
  if (tmpDrumSequences.length > 0) {
    drumSequences.push(
      generator.drumSequencesToPitchSequence(tmpDrumSequences)
    );
    drumTrackCounts.push(tmpDrumSequences.length);
  }
  let generatedMelodySequences = await generator.generate(
    seed,
    melodySequences,
    2,
    0.99,
    true,
    false,
    generatedNotesStepsCount,
    progressBar
  );
  let generatedDrumPitchSequences = await generator.generate(
    seed,
    drumSequences,
    2,
    0.99,
    false,
    true,
    generatedNotesStepsCount,
    progressBar
  );
  let generatedDrumSequences = generatedDrumPitchSequences
    .map((dp, i) =>
      generator.pitchSequenceToDrumSequences(dp, drumTrackCounts[i])
    )
    .flat();
  generatedMelodySequences = generatedMelodySequences.filter(
    (s) => s.notes.length > 0
  );
  generatedDrumSequences = generatedDrumSequences.filter(
    (s) => s.notes.length > 0
  );
  const generatedSequences = generatedMelodySequences.concat(
    generatedDrumSequences
  );
  player.setTrackCount(generatedPlayer, generatedSequences.length);
  player.setTrackSounds(
    generatedPlayer,
    generatedSequences.map((s, i) => {
      const isDrum = i >= generatedMelodySequences.length;
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
  const defaultTracks = [
    { mml: "l16 o4 r>c2. r8c r<a+2. r8a+", isDrum: false },
    { mml: "l16 o4 fc+fg8c8g8 c8fgcfg fcfg8c8f8 c8ffcfg", isDrum: false },
    { mml: "l16 o4 crrr crrr crrr crrr crrr crrr crrr crrr", isDrum: true },
    { mml: "l16 o4 rrrr crrr rrrr crrr rrrr crrr rrrr crrr", isDrum: true },
    { mml: "l16 o4 rcrr rrrc rcrr rrrr rcrr rrrc rcrr rrrr", isDrum: true },
    { mml: "l16 o4 rrcr rrcr rrcr rrcr rrcr rrcr rrcr rrcr", isDrum: true },
  ];
  generatedPlayer = player.get(1, document.getElementById("main"), () => {
    player.stop(originPlayer);
    player.playStopToggle(generatedPlayer);
  });
  originPlayer = player.get(
    defaultTracks.length,
    document.getElementById("main"),
    () => {
      player.stop(generatedPlayer);
      player.playStopToggle(originPlayer);
    }
  );
  player.setTrackSounds(
    originPlayer,
    defaultTracks.map((t) => {
      const isDrum = t.isDrum;
      return {
        soundEffect: isDrum
          ? soundEffect.get("hit", 1, 2, 0.1)
          : soundEffect.get("select", 1, 2, 0.1, 0.35173364),
        isDrum,
      };
    })
  );
  player.setMmlStrings(
    originPlayer,
    defaultTracks.map((t) => t.mml)
  );
  seedTextInput = document.getElementById("random_seed") as HTMLInputElement;
  document.getElementById("generate").addEventListener("click", () => {
    const seed = seedRandom.getInt(999999999);
    seedTextInput.value = `${seed}`;
    setTimeout(() => generate(seed), 0);
  });
  document
    .getElementById("generate_from_seed")
    .addEventListener("click", () => {
      const seed = Number.parseInt(seedTextInput.value);
      setTimeout(() => generate(seed), 0);
    });
  generatedStepsCountTextInput = document.getElementById(
    "generated_steps_count"
  ) as HTMLInputElement;
  generatedStepsCountTextInput.value = `${defaultGeneratedNotesStepsCount}`;
  progressBar = document.getElementById("progress_bar") as HTMLDivElement;
  update();
}

window.addEventListener("load", init);
