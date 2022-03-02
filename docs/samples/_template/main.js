function init() {
  ggg.init(1);
  ggg.setTempo(150);
  window.addEventListener("click", () => {
    ggg.startAudio();
  });
  update();
}

function update() {
  requestAnimationFrame(update);
  ggg.update();
}

window.addEventListener("load", init);
