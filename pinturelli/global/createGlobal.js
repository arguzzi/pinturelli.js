import Config from "./Config.js";
import History from "./History.js";

import EventBus from "../rx/EventBus.js";
import PrimaryDispatcher from "../rx/PrimaryDispatcher.js";
import gestures from "../rx/gestures/gesturesPipelines.js";
import context from "../rx/context/contextPipelines.js";
import PrimaryEmitter from "../rx/PrimaryEmitter.js";

import loadAndRunSketch from "./loadAndRunSketch.js";
import setNativeListeners from "../rx/setNativeListeners.js"

import exportedClasses from "../ui/UiClasses.js";
import UiRoot from "../ui/UiRoot.js";
import Painter from "./Painter.js";

const pipelines = { gestures, context };

////////////////////////////
//
export default function createGlobal(resolution, options, instance = "") {
  const GLOBAL = {};
  
  // inputs
	GLOBAL.INSTANCE = instance;
	GLOBAL.CONFIG = Object.freeze(new Config(GLOBAL, resolution, options));
  
  // memory
	GLOBAL.DRAW_LIST = [];
	GLOBAL.ALL_NODES = Object.freeze(new Map());
	GLOBAL.HISTORY = Object.freeze(new History(GLOBAL)); // singleton
  
  // init sketch
	GLOBAL.SKETCH = loadAndRunSketch(GLOBAL);
	GLOBAL.PAINTER = Object.freeze(new Painter(GLOBAL));

  // events
	GLOBAL.EVENT_BUS = Object.freeze(new EventBus(GLOBAL));
  GLOBAL.DISPATCHER = Object.freeze(new PrimaryDispatcher(GLOBAL));
  GLOBAL.EMITTER = Object.freeze(new PrimaryEmitter(GLOBAL, pipelines));
  GLOBAL.DISPATCHER.setupConection(GLOBAL);
  setNativeListeners(GLOBAL);

  // ui tree
	GLOBAL.CLASSES = Object.freeze(exportedClasses);
	GLOBAL.UI_ROOT = Object.freeze(new UiRoot(GLOBAL));
  
  // output
  return Object.freeze(GLOBAL);
}
