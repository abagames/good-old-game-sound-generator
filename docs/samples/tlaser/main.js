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
  ggg.init(8);
  ggg.setTempo(150);
  ["mousedown", "touchstart", "mouseup", "touchend", "keydown"].forEach((e) => {
    document.addEventListener(e, () => {
      ggg.startAudio();
    });
  });
}

window.addEventListener("load", init);

const bgm = [
  "@synth@s734516504 v40 l4. o4 r16gr16 gr16>c r16<f+ r16g2.^8. r16 >a+ r16g",
  "@select@s339235601 v25 l16 o4 c+ccccccc c<g>ccdcdc cccccccc cc+8c+8c+rc+ r<g>cccccc c<g>c<ggg>cc <g+a+a+a+a+a+a+r g+ggg>cr<g>c",
  "@hit@d@s527705593 v50 l16 o4 cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8.",
  "@click@d@s404522195 v50 l16 o4 rcr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rcr4.^16 cr4^16c rcr4.",
  "@explosion@d@s586342200 v40 l16 o4 r8cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr8. cr8.cr",
];
