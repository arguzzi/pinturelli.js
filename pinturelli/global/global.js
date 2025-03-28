import Config from "Config.js";
import PrimaryEmitter from "../rx/PrimaryEmitter.js";
import PrimaryDispatcher from "../rx/PrimaryDispatcher.js";
import EventBus from "../rx/EventBus.js";
import Root from "../ui/Root.js";
import loadSketch from "sketch.js";

//////////////////////////////
//
export default function createGlobal(resolution, debug) {
  const GLOBAL = {};

  // inputs
	GLOBAL.CONFIG = Object.freeze(new Config(resolution, debug));

  // memory
	GLOBAL.ALL_NODES = Object.freeze(new Map());
	GLOBAL.DRAW_LIST = [];

  // events
	GLOBAL.EMITTER = Object.freeze(new PrimaryEmitter(GLOBAL));
	GLOBAL.DISPATCHER = Object.freeze(new PrimaryDispatcher(GLOBAL));
	GLOBAL.EVENT_BUS = Object.freeze(new EventBus(GLOBAL));
  
  // init
	GLOBAL.UI_ROOT = new Root(GLOBAL);
  Object.freeze(GLOBAL);
	loadSketch(GLOBAL);

  // output
  return GLOBAL;
}
