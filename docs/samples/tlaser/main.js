title = "T LASER";

description = `
[Slide]
 Move sight
`;

characters = [
  `
  gg
  gg
l gg l
llggll
 lggl
 lggl
`,
  `
     r
 l  l
l    l
l    l
 l  l
r
`,
];

options = {
  theme: "dark",
  isReplayEnabled: true,
  isSoundEnabled: false,
};

let inputPressedPos;
/** @type {{pos: Vector, pressedPos: Vector}} */
let sight;
/**
 * @type {{
 * pos: Vector, z: number, vel: Vector, lockIndex: number, lockTicks: number}[]}
 */
let enemies;
let nextEnemyTicks;
let lockIndex;
/**
 * @type {{
 * pos: Vector, z: number, vel: Vector, lockIndex: number, posHistory: Vector[],
 * }}
 */
let laser;
/** @type {{pos: Vector, z: number}[]} */
let stars;
let multiplier;

function update() {
  if (!ticks) {
    init();
    if (!isReplaying) {
      ggg.playMml(bgm);
    }
    inputPressedPos = vec();
    sight = { pos: vec(50, 50), pressedPos: vec() };
    enemies = [];
    nextEnemyTicks = 0;
    lockIndex = 0;
    laser = undefined;
    stars = times(50, () => {
      return { pos: vec(rnd(99), rnd(-20, 120)), z: rnd(0.5, 3) };
    });
    multiplier = 1;
  }
  stars.forEach((s, i) => {
    s.pos.y += 0.3 / sqrt(s.z);
    if (s.pos.y > 120) {
      s.pos.y -= 140;
    }
    // @ts-ignore
    color(["cyan", "yellow", "red"][i % 3]);
    rect(s.pos, 1, 1);
  });
  color("black");
  if (input.isJustPressed) {
    inputPressedPos.set(input.pos);
    sight.pressedPos.set(sight.pos);
  }
  if (input.isPressed) {
    sight.pos.set(input.pos).sub(inputPressedPos).add(sight.pressedPos);
  } else {
    sight.pos.set(input.pos);
  }
  sight.pos.clamp(0, 99, 0, 99);
  char("b", sight.pos);
  let ti = 9999999;
  let te;
  enemies.forEach((e) => {
    const li = e.lockIndex;
    if (li >= 0 && li < ti) {
      ti = li;
      te = e;
    }
  });
  if (laser == null && te != null) {
    ggg.playSoundEffect("explosion");
    laser = {
      pos: vec(50, 99),
      z: 1,
      vel: vec(0, -1),
      lockIndex: 0,
      posHistory: [vec(50, 99)],
    };
    color("black");
    particle(50, 99, 30, 3, -PI / 2, PI / 4);
    multiplier = 1;
  }
  if (laser != null) {
    let vz = 0;
    if (te != null) {
      // @ts-ignore
      laser.vel.add(vec(te.pos).sub(laser.pos).mul(0.5));
      laser.vel.mul(0.5);
      // @ts-ignore
      vz = (te.z - laser.z) * 0.1;
      laser.z += vz;
    } else {
      laser.vel.normalize().mul(5);
    }
    laser.pos.add(
      vec(laser.vel)
        .div(laser.z)
        .div(1 + abs(vz) * 9)
    );
    laser.posHistory.push(vec(laser.pos));
    if (laser.posHistory.length > 19) {
      laser.posHistory.shift();
    }
    let pp;
    laser.posHistory.forEach((p, i) => {
      if (pp != null) {
        color(rnd() < i / 9 ? "purple" : "black");
        const rs = 5 / laser.z;
        line(
          pp.x + rnds(rs),
          pp.y + rnds(rs),
          p.x + rnds(rs),
          p.y + rnds(rs),
          3 / laser.z
        );
      }
      pp = p;
    });
    const o = 99 / laser.z;
    if (!laser.pos.isInRect(-o, -o, 100 + o * 2, 100 + o * 2)) {
      laser = undefined;
      multiplier = 1;
    }
  }
  nextEnemyTicks--;
  if (nextEnemyTicks < 0) {
    const c = rndi(3, 6);
    const vel = vec(0, rnds(0.2, 0.3)).mul(sqrt(difficulty));
    const pos = vec(rnd(10, 90), vel.y > 0 ? -5 : 105);
    const z = rnd(0.5, 3);
    vel.div(sqrt(z));
    times(c, () => {
      enemies.push({ pos: vec(pos), z, vel, lockIndex: -1, lockTicks: 9 });
      pos.y -= vel.y * 30;
    });
    nextEnemyTicks += rnd(60, 99) / difficulty;
  }
  remove(enemies, (e) => {
    e.pos.add(e.vel);
    const sc = 1 / sqrt(e.z);
    color("black");
    const c = char("a", e.pos, {
      scale: { x: sc, y: sc },
      mirror: { y: e.vel.y > 0 ? -1 : 1 },
    }).isColliding;
    if (e === te && c.rect.purple) {
      ggg.playSoundEffect("hit", 7);
      particle(e.pos, 9, 2 / sqrt(e.z));
      addScore(multiplier, e.pos);
      multiplier++;
      return true;
    }
    if (e.lockIndex < 0 && c.char.b) {
      ggg.playSoundEffect("select");
      e.lockIndex = lockIndex;
      lockIndex++;
    }
    if (e.lockIndex >= 0) {
      if (e.lockTicks > 0) {
        e.lockTicks--;
      }
      let a = -PI / 2 - e.lockTicks * 0.3;
      const r = 5 + e.lockTicks * 5;
      times(4, (i) => {
        const pa = a;
        a += (PI * 2) / (3 + (1 / 8) * e.lockTicks);
        line(vec(r).rotate(pa).add(e.pos), vec(r).rotate(a).add(e.pos), 1);
      });
    }
    if (e.lockIndex < 0 && (e.vel.y < 0 ? e.pos.y < 0 : e.pos.y > 99)) {
      color("red");
      text("X", e.pos.x, clamp(e.pos.y, 5, 95), { scale: { x: 1.5, y: 1.5 } });
      ggg.playSoundEffect("random", 3);
      gameOver();
    }
  });
  color("black");
  text(`x${multiplier}`, 3, 9);
  ggg.update();
}

let isInitialized = false;

function init() {
  if (isInitialized) {
    return;
  }
  isInitialized = true;
  ggg.init(3);
  ["mousedown", "touchstart", "mouseup", "touchend", "keydown"].forEach((e) => {
    window.addEventListener(e, () => {
      ggg.startAudio();
    });
  });
}

function gameOver() {
  ggg.stopMml();
  end();
}

const bgm = {
  parts: [
    {
      mml: "l4 o3 <bb >d8e4. d8e8g b2 g2 f+2 ee e2",
      soundEffect: {
        type: "synth",
        params: [
          {
            oldParams: true,
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.7522013664134316,
            p_env_punch: 0.74580539989886,
            p_env_decay: 0.1345223281380074,
            p_base_freq: 0.35173364,
            p_freq_limit: 0,
            p_freq_ramp: 0,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0.543213830223124,
            p_duty: 0.6239351359251736,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 0.20484364967037968,
            p_lpf_ramp: -0.1541160925184647,
            p_lpf_resonance: 0.48152642848005667,
            p_hpf_freq: 0,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
        ],
        volume: 0.1,
      },
      isDrum: false,
    },
    {
      mml: "l16 o2 >e<bbbbbbe ggaaaa>e<a >ddeer8.g eeeeeeee <gggggggg bbf+bf+f+f+b aaaaaaaa aaaaeaaa",
      soundEffect: {
        type: "select",
        params: [
          {
            oldParams: true,
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.12872389001509266,
            p_env_punch: 0,
            p_env_decay: 0.16418133651935063,
            p_base_freq: 0.35173364,
            p_freq_limit: 0,
            p_freq_ramp: 0,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 1,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.1,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 0,
            p_env_attack: 0,
            p_env_sustain: 0.1801292104134637,
            p_env_punch: 0,
            p_env_decay: 0.0808790894413551,
            p_base_freq: 0.35173364,
            p_freq_limit: 0,
            p_freq_ramp: 0,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0.09718620593128405,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.1,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
        ],
        volume: 0.05,
      },
      isDrum: false,
    },
    {
      mml: "l16 o4 cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.c",
      soundEffect: {
        type: "explosion",
        params: [
          {
            oldParams: true,
            wave_type: 3,
            p_env_attack: 0,
            p_env_sustain: 0.3439296349985361,
            p_env_punch: 0.2615047691998782,
            p_env_decay: 0.11910362299976489,
            p_base_freq: 0.29306843344697764,
            p_freq_limit: 0,
            p_freq_ramp: 0,
            p_freq_dramp: 0,
            p_vib_strength: 0.32996147457276503,
            p_vib_speed: 0.012067101339825219,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0,
            p_duty_ramp: 0,
            p_repeat_speed: 0.6965959967804598,
            p_pha_offset: -0.2219698573979479,
            p_pha_ramp: -0.2989030129040831,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
        ],
        volume: 0.05,
      },
      isDrum: true,
    },
    {
      mml: "l16 o4 r8crcrcr8. crcrcr8. crcrcr8. crcrcr8. crcrcr8. crcrcr8. crcrcr8. crcrc",
      soundEffect: {
        type: "click",
        params: [
          {
            oldParams: true,
            wave_type: 0,
            p_env_attack: 0,
            p_env_sustain: 0.01608374196013523,
            p_env_punch: 0,
            p_env_decay: 0.24781649567834485,
            p_base_freq: 0.8167052814543027,
            p_freq_limit: 0,
            p_freq_ramp: -0.5874786259344497,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0.00808409890348187,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.943808144620575,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 3,
            p_env_attack: 0,
            p_env_sustain: 0.0460253231334559,
            p_env_punch: 0,
            p_env_decay: 0.200810847408327,
            p_base_freq: 0.7669449161079118,
            p_freq_limit: 0,
            p_freq_ramp: -0.05804369704752316,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.9251183348067846,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
        ],
        volume: 0.1,
      },
      isDrum: true,
    },
    {
      mml: "l16 o4 rcr4^16c rcr8.cr8. cr4^16c rcr4.^16 cr4^16c rcr8.cr8. cr4^16c rc",
      soundEffect: {
        type: "click",
        params: [
          {
            oldParams: true,
            wave_type: 3,
            p_env_attack: 0,
            p_env_sustain: 0.11015759602477684,
            p_env_punch: 0.42798021212871656,
            p_env_decay: 0.17062003965263267,
            p_base_freq: 0.8840516867661038,
            p_freq_limit: 0,
            p_freq_ramp: -0.404540068214885,
            p_freq_dramp: 0,
            p_vib_strength: 0.3795964467757373,
            p_vib_speed: 0.29586053599972756,
            p_arp_mod: 0.5788939520201866,
            p_arp_speed: 0.6733370588564633,
            p_duty: 0,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0.20961354093384316,
            p_pha_ramp: -0.2483138899664194,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.9709438895971849,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 3,
            p_env_attack: 0,
            p_env_sustain: 0.05598486562097304,
            p_env_punch: 0.46704374455545183,
            p_env_decay: 0.14910412910542212,
            p_base_freq: 0.783836289549674,
            p_freq_limit: 0,
            p_freq_ramp: 0.0771324985141709,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0.4655391610380121,
            p_arp_speed: 0.8330667028746257,
            p_duty: 0,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.975972319505171,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
        ],
        volume: 0.1,
      },
      isDrum: true,
    },
  ],
  notesStepsCount: 64,
};
