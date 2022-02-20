title = "";

description = `
`;

characters = [];

options = {
  isSoundEnabled: false,
};

function update() {
  if (!ticks) {
  }
  ggg.update();
}

function gameOver() {
  ggg.stopMml();
  end();
}

function init() {
  ggg.init(1);
  ["mousedown", "touchstart", "mouseup", "touchend", "keydown"].forEach((e) => {
    window.addEventListener(e, () => {
      ggg.startAudio();
    });
  });
}

window.addEventListener("load", init);
