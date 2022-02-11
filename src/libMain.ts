import { init as initAudio } from "./audio";
import * as soundEffect from "./soundEffect";
import * as part from "./part";

export function update() {
  part.update();
  soundEffect.update();
}

function init() {
  initAudio();
  soundEffect.init();
}

window.addEventListener("load", init);
