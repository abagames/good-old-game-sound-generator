title = "";

description = `
`;

characters = [];

options = {
  isSoundEnabled: false,
};

function update() {
  if (!ticks) {
    init();
  }
  ggg.update();
}

let isInitialized = false;

function init() {
  if (isInitialized) {
    return;
  }
  isInitialized = true;
  ggg.init(1);
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
