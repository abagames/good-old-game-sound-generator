title = "BALL TOUR";

description = `
[Hold]
 Move forward
`;

characters = [
  `
llllll
l l ll
l l ll
llllll
 l  l
 l  l
  `,
  `
llllll
l l ll
l l ll
llllll
ll  ll
  `,
  `
 lll
ll ll
l lll
lllll
 lll
 ll
`,
];

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
    document.addEventListener(e, () => {
      // Calling the `startAudio` function from within the event handler of
      // a user operation will enable audio.
      ggg.startAudio();
    });
  });
}

window.addEventListener("load", init);

// MML JSON data for BGM.
const bgm = {
  parts: [
    {
      mml: "l16 o3 f+8f+f+f+8f+e f+1 r br>c8rc+c8 rc<b8.>c+<b r>c+f+f+2.^8.",
      soundEffect: {
        type: "synth",
        params: [
          {
            Frequency: { Start: 261.6 },
            Generator: { Func: "saw", A: 0.8716629256661197 },
            Volume: {
              Attack: 0,
              Sustain: 1.9943911731230075,
              Punch: 0.0814976066075027,
              Decay: 0.6290331843143873,
            },
          },
        ],
        volume: 0.04,
      },
      isDrum: false,
    },
    {
      mml: "l4 o4 r2 f+f+ f+8r8f+1",
      soundEffect: {
        type: "synth",
        params: [
          {
            Frequency: { Start: 261.6 },
            Generator: { Func: "saw", A: 0.6970408271758447 },
            Volume: {
              Attack: 0,
              Sustain: 1.2583366723866987,
              Punch: 0.2931877487090388,
              Decay: 0.16856516950497524,
            },
          },
        ],
        volume: 0.04,
      },
      isDrum: false,
    },
    {
      mml: "l16 o4 cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.c",
      soundEffect: {
        type: "hit",
        params: [
          {
            Frequency: {
              Start: 106.41011782139775,
              Slide: -0.3791780821232074,
            },
            Generator: {
              Func: "saw",
              A: 0.13738496977309345,
              ASlide: 0.03646126122597171,
            },
            Filter: { HP: 0.023415383515743394 },
            Volume: {
              Sustain: 0.09693810066602615,
              Decay: 0.27297980635729147,
            },
          },
          {
            Frequency: {
              Start: 106.41011782139775,
              Slide: -0.4378967092693543,
            },
            Generator: {
              Func: "saw",
              A: 0.28715216943229366,
              ASlide: 0.3690589440215982,
            },
            Volume: {
              Sustain: 0.0031239091193126303,
              Decay: 0.10987028847678339,
            },
          },
        ],
        volume: 0.05,
      },
      isDrum: true,
    },
    {
      mml: "l16 o4 rcr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rc",
      soundEffect: {
        type: "click",
        params: [
          {
            Frequency: { Start: 108.1473764749587, Slide: 0.1453852235910914 },
            Generator: {
              Func: "saw",
              A: 0.5430990815030176,
              ASlide: -0.3253812691721556,
            },
            Filter: { HP: 0.021106156478893513 },
            Volume: {
              Sustain: 0.013134795372522722,
              Decay: 0.058677021103531436,
            },
          },
          {
            Frequency: {
              Start: 108.1473764749587,
              Slide: -0.23950459988310574,
            },
            Generator: {
              Func: "saw",
              A: 0.18758877040529362,
              ASlide: -0.3577890116390281,
            },
            Filter: { HP: 0.1963873411986016 },
            Volume: {
              Sustain: 0.010876404040571757,
              Decay: 0.10226421674875319,
            },
          },
        ],
        volume: 0.05,
      },
      isDrum: true,
    },
    {
      mml: "l16 o4 r8cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.c",
      soundEffect: {
        type: "click",
        params: [
          {
            Frequency: {
              Start: 194.94672336032306,
              Slide: -0.44396584055944477,
            },
            Generator: {
              Func: "saw",
              A: 0.01724358452885495,
              ASlide: 0.49086691927883475,
            },
            Filter: { HP: 0.0271003732520855 },
            Volume: { Sustain: 0.0189983426971502, Decay: 0.0511840462379394 },
          },
          {
            Frequency: {
              Start: 194.94672336032306,
              Slide: -0.0408363086033697,
            },
            Generator: { Func: "noise" },
            Volume: {
              Sustain: 0.06844298263339794,
              Decay: 0.13184771524604505,
              Punch: 0.27086158089126966,
            },
          },
        ],
        volume: 0.05,
      },
      isDrum: true,
    },
  ],
  notesStepsCount: 64,
};
