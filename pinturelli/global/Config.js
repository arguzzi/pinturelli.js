import { typedParams } from "../debug/types.js";

export default class Config {
  #resolution;
  #canvas;
  #debug;

  //____________
  constructor(resolution, debugging) {

    // singleton
    if (Config.instance) return Config.instance;
    Config.instance = this;
    
    this.updateDebug(debugging);
    
    if (this.debug) typedParams.number(resolution);
    this.#resolution = resolution;
    this.updateCanvas();

    this.initDateNow = Date.now();
  }
  
  //____________
  get resolution() { return this.#resolution };
  get canvas() { return this.#canvas };
  get debug() { return this.#debug };

  //____________
  updateCanvas() {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const proportionalHeight = Math.floor((this.#resolution * vh) / vw);
    this.#canvas = { w: this.#resolution, h: proportionalHeight };
  }

  //____________
  updateDebug(mode) {
    if (mode === true) {
      console.log(`### Debugger mode is now active!`);
      this.#debug = true;
      return;
    }
    
    console.log(`### Debugger turned off`);
    this.#debug = false;
  }
}
