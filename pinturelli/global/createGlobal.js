// import apiErrors from "./debug/apiErrorsGlobalTypes.js";

import runSketch from "./runSketch.js";
import Painter from "./Painter.js";
import EventBus from "../rx/EventBus.js";
import PrimaryDispatcher from "../rx/PrimaryDispatcher.js";
import gesturesPipeline from "../rx/pipelines/gesturesIndex.js";
import contextPipeline from "../rx/pipelines/contextIndex.js";
import PrimaryEmitter from "../rx/PrimaryEmitter.js";
import setNativeListeners from "../rx/setNativeListeners.js";

import UiRoot from "../ui/UiRoot.js";

const pipelines = { gesturesPipeline, contextPipeline };

////////////////////////////
//
export default rawDescription => {
  // apiErrors.globalDescription(description);

  const description = {
    ...rawDescription,
    memoryLogs: !!rawDescription?.debugSelector,
    debugSelector: rawDescription?.debugSelector ?? "",
    containerId: rawDescription?.containerId ?? "",
    resolutionX: rawDescription?.resolutionX ?? 540,
    resolutionY: rawDescription?.resolutionY ?? null,
    proportion: rawDescription?.proportion ?? null,
    q5WebGpuMode: rawDescription?.q5WebGpuMode ?? false,
    q5PixelatedMode: rawDescription?.q5PixelatedMode ?? false,
    q5NoAlphaMode: rawDescription?.q5NoAlphaMode ?? false,
  }

  // will be freezed!!!
  const GLOBAL = {};
  
  // general
	GLOBAL.ALL_NODES = description.allNodesProxy;
	GLOBAL.SKETCH = runSketch(GLOBAL.ALL_NODES, description);
  const getTree = path => description.selectAll(`${description.id} ${path}`);
	GLOBAL.PAINTER = Object.freeze(new Painter(getTree, GLOBAL.SKETCH));

  // events
	GLOBAL.EVENT_BUS = Object.freeze(new EventBus(GLOBAL));
  GLOBAL.DISPATCHER = Object.freeze(new PrimaryDispatcher(GLOBAL));
  GLOBAL.EMITTER = Object.freeze(new PrimaryEmitter(GLOBAL, pipelines));
  GLOBAL.DISPATCHER._setupConection(GLOBAL);
  setNativeListeners(GLOBAL.EMITTER);

  // output
	GLOBAL.UI_ROOT = Object.freeze(new UiRoot(GLOBAL.SKETCH, description));
  return Object.freeze(GLOBAL); // only refereced by registry
}
