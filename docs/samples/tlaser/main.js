title = "T LASER";

description = `
[Slide]
 Move sight
`;

characters = [
  `
  gG
  gG
L gG l
LLgGll
 LgGl
 LgGl
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
let releasedPos = vec();

function update() {
  if (!ticks) {
    if (!isReplaying) {
      ggg.playMml(bgm, 0.07);
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
    color(["light_cyan", "light_yellow", "light_red"][i % 3]);
    rect(s.pos, 1, 1);
  });
  color("black");
  if (input.isJustPressed) {
    inputPressedPos.set(input.pos);
    sight.pressedPos.set(sight.pos);
  }
  if (input.isJustReleased) {
    releasedPos.set(input.pos);
  }
  if (input.isPressed) {
    sight.pos.set(input.pos).sub(inputPressedPos).add(sight.pressedPos);
  } else if (input.pos.distanceTo(releasedPos) > 1) {
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
      ggg.playSoundEffect("hit");
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

function gameOver() {
  ggg.stopMml();
  end();
}

function init() {
  ggg.init(11);
  ["mousedown", "touchstart", "mouseup", "touchend", "keydown"].forEach((e) => {
    document.addEventListener(e, () => {
      ggg.startAudio();
    });
  });
}

window.addEventListener("load", init);

const bgm = {
  parts: [
    {
      mml: "l8 o4 r16g+2 rg+a+b d+1 >c+2 <b16 r16a+f+f c+2.^8.",
      soundEffect: {
        type: "synth",
        params: [
          {
            oldParams: true,
            wave_type: 0,
            p_env_attack: 0,
            p_env_sustain: 0.49090752482668204,
            p_env_punch: 0.945394685246375,
            p_env_decay: 0.6119192233336901,
            p_base_freq: 0.35173364,
            p_freq_limit: 0,
            p_freq_ramp: 0,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0.7454,
            p_arp_speed: 0.6272523117082316,
            p_duty: 0.677988391993099,
            p_duty_ramp: 0.5175958854420101,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0.9465195052201207,
            p_lpf_resonance: 0.7178069308208783,
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
      mml: "l16 o4 f+d+8c+4c+8 d+8d+8f8e d+8d+8d+8d+8 g+d+g+d+g+g+g+g+ g+f+c+f+f+<f+>f+8 e8f8f+8f8 fc+c+8c+8c+8 f+c+f+8f+8c+8",
      soundEffect: {
        type: "select",
        params: [
          {
            oldParams: true,
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.15881606446551533,
            p_env_punch: 0,
            p_env_decay: 0.1482960673394371,
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
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.19462825381071966,
            p_env_punch: 0,
            p_env_decay: 0.13410785797380562,
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
        ],
        volume: 0.05,
      },
      isDrum: false,
    },
    {
      mml: "l16 o4 cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.c",
      soundEffect: {
        type: "click",
        params: [
          {
            oldParams: true,
            wave_type: 0,
            p_env_attack: 0,
            p_env_sustain: 0.052304768830608764,
            p_env_punch: 0,
            p_env_decay: 0.16039933815142127,
            p_base_freq: 0.7928503929969972,
            p_freq_limit: 0,
            p_freq_ramp: -0.05274250254797341,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0.2571233739278101,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.963542880179254,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 3,
            p_env_attack: 0,
            p_env_sustain: 0.001954310624976907,
            p_env_punch: 0,
            p_env_decay: 0.12097926257176529,
            p_base_freq: 0.8486520906674331,
            p_freq_limit: 0,
            p_freq_ramp: 0.23804346163245926,
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
            p_hpf_freq: 0.9036174191636074,
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
      mml: "l16 o4 r4cr4.^16 cr4.^16 cr4.^16 cr4.^16 cr4.^16 cr4.^16 cr4.^16 c",
      soundEffect: {
        type: "hit",
        params: [
          {
            oldParams: true,
            wave_type: 3,
            p_env_attack: 0,
            p_env_sustain: 0.0010151169730851235,
            p_env_punch: 0,
            p_env_decay: 0.29747202331141387,
            p_base_freq: 0.4495645253103144,
            p_freq_limit: 0,
            p_freq_ramp: -0.5276890262560194,
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
            p_hpf_freq: 0,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.00045944652530817464,
            p_env_punch: 0,
            p_env_decay: 0.2992982399648284,
            p_base_freq: 0.3847142055129433,
            p_freq_limit: 0,
            p_freq_ramp: -0.5564664321617379,
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
            p_hpf_freq: 0.13524610107653917,
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
      mml: "l16 o4 rcr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rcr8.c",
      soundEffect: {
        type: "hit",
        params: [
          {
            oldParams: true,
            wave_type: 0,
            p_env_attack: 0,
            p_env_sustain: 0.08517369746351003,
            p_env_punch: 0,
            p_env_decay: 0.19336790114021113,
            p_base_freq: 0.7602979077865131,
            p_freq_limit: 0,
            p_freq_ramp: -0.5822384942048785,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0.2946723396178969,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0.10360224687112547,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.06361106167631482,
            p_env_punch: 0,
            p_env_decay: 0.1944800751969405,
            p_base_freq: 0.6173647807020146,
            p_freq_limit: 0,
            p_freq_ramp: -0.5181723041036568,
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
            p_hpf_freq: 0,
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
      mml: "l16 o4 r8cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.c",
      soundEffect: {
        type: "hit",
        params: [
          {
            oldParams: true,
            wave_type: 0,
            p_env_attack: 0,
            p_env_sustain: 0.09910904960686086,
            p_env_punch: 0,
            p_env_decay: 0.2868394216957594,
            p_base_freq: 0.5029552703963023,
            p_freq_limit: 0,
            p_freq_ramp: -0.40645939803367004,
            p_freq_dramp: 0,
            p_vib_strength: 0,
            p_vib_speed: 0,
            p_arp_mod: 0,
            p_arp_speed: 0,
            p_duty: 0.3945497737719094,
            p_duty_ramp: 0,
            p_repeat_speed: 0,
            p_pha_offset: 0,
            p_pha_ramp: 0,
            p_lpf_freq: 1,
            p_lpf_ramp: 0,
            p_lpf_resonance: 0,
            p_hpf_freq: 0,
            p_hpf_ramp: 0,
            sound_vol: 0.5,
            sample_rate: 44100,
            sample_size: 8,
          },
          {
            oldParams: true,
            wave_type: 1,
            p_env_attack: 0,
            p_env_sustain: 0.030063525408055528,
            p_env_punch: 0,
            p_env_decay: 0.23175911417504752,
            p_base_freq: 0.5342424491267285,
            p_freq_limit: 0,
            p_freq_ramp: -0.38586195904898035,
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
            p_hpf_freq: 0.1282606711676951,
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
