import dbgr from "../debug/validateUserApi.js";
import output from "../debug/debuggerOutput.js";

export default class Config {
  #DEBUG;

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL, resolution, options = {}) {
    const { 
      debugMode = false, 
      parentId = "",
      noAlpha = false, 
      displayModeArgs = [],
      frameRate = 60,
    } = options;

    // init
    this.INSTANCE = GLOBAL.INSTANCE;
    this.INITIAL_TIME = Date.now();
    this.updateDebug(debugMode);
    if (this.#DEBUG) dbgr.configParams(resolution, options);

    // canvas
    this.CANVAS = {
      resolutionX: null,
      resolutionY: null,
      _elt: null,
    }

    // view
    this.RESOLUTION = resolution;
    this.resizeCanvas();
    
    // root
    this.ROOT_PROTO_ID = "_pinturelli_";
    this.MAGIC_NUMBER = 250250250250250;
    
    // q5 options
    this.Q5_CONFIG = {
      parentId: parentId,
      alpha: !noAlpha,
      displayModeArgs: displayModeArgs ?? ["maxed"],
      originalFrameRate: frameRate,
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
