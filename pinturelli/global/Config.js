import dbgr from "../debug/apiErrors.js";
import output from "../debug/_debugOutput.js";

export default class Config {
  #DEBUG;

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL, description = {}) {
    const { 
      debugMode = false,
      containerId = undefined, // Default: none (caputre main or body)
      resolutionX = 540,  // Default: 540. inner resolution, not final size
      resolutionY = undefined,  // Default: 0 (auto). if both x/y are set = fixed ratio
      proportion = undefined, // Default: viewport ratio | overwridden if x/y are both set
      noAlpha = false, // Default: false
      setup,
      id,
    } = description;

    // init
    this.INSTANCE = GLOBAL.INSTANCE;
    this.INITIAL_TIMESTAMP = performance.now();
    this.updateDebug(debugMode);
    if (this.#DEBUG) dbgr.configParams(resolution, options);

    // canvas
    this.CANVAS = {
      resolutionX,
      resolutionY,
      _elt: document.getElementById(containerId),
    }

    // view
    this.RESOLUTION = resolution;
    this.resizeCanvas();
    
    // root
    this.ROOT_PROTO_ID = "_pinturelli_";
    this.MAGIC_NUMBER = 250250250250250;
    
    // q5 options
    this.Q5_CONFIG = {
      containerId: containerId,
      alpha: !noAlpha,
      displayModeArgs: displayModeArgs ?? ["maxed"],
      originalFrameRate: frameRate,
      ...setup,
    }
  }
  
  //____________
  get DEBUG() { return this.#DEBUG };
  updateDebug(mode) {
    if (mode === true) this.#DEBUG = true;
    else this.#DEBUG = false;
    output.firstLog(this.#DEBUG, this.INSTANCE);
  }

  //____________
  resizeCanvas() {
    const vvpt = !!window.visualViewport;
		const vw = vvpt ? window.visualViewport.width : window.innerWidth;
		const vh = vvpt ? window.visualViewport.height : window.innerHeight;
    const proportionalHeight = Math.floor((this.RESOLUTION * vh) / vw);
    this.CANVAS.resolutionX = this.RESOLUTION;
    this.CANVAS.resolutionY = proportionalHeight;
  }
}
