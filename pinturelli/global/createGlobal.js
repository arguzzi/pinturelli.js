import { testMode } from "../debug/_allModesFlags.js";
import validate from "../debug/testMode/validateGlobal.js";

import CatPainter from "./CatPainter.js";
import EventBus from "../rx/EventBus.js";
import PrimaryDispatcher from "../rx/PrimaryDispatcher.js";
import PrimaryEmitter from "../rx/PrimaryEmitter.js";
import UiRoot from "../ui/UiRoot.js";

import { getRootSize } from "../ui/calculateBox.js";
import getQ5Instance from "./getQ5Instance.js";
import setNativeListeners from "../rx/setNativeListeners.js";
import setSketchSetup from "./setSketchSetup.js";

import gesturesPipeline from "../rx/pipelines/gesturesIndex.js";
import contextPipeline from "../rx/pipelines/contextIndex.js";

const allPipelines = { gesturesPipeline, contextPipeline };

/*
dependencies = {
  allNodes: this.#allNodesProxyCreator(rootId),
  selectAll: path => this._pinturelliRiskySelectAll(path),
  treeInitializer: () => this.#initializeTree(rootId),
  maintenanceTasks: () => this.#runMaintenanceTasks(),
  _getFollowerIds: () => new Set(this.#allFollowers.get(rootId)),
}*/

////////////////////////////
//
export default (dependencies, rawDescription) => {
  if (testMode) {
    validate.params({ dependencies, description: rawDescription });
    validate.uiSystem({ CatPainter, UiRoot });
    validate.rxSystem({ EventBus, PrimaryDispatcher, PrimaryEmitter });
    validate.pipelines({ ...allPipelines });
  }

  const GLOBAL = {}; // will be freezed!!!
  const freeze = obj => Object.freeze(obj);
  const getDependencies = () => freeze({ ...dependencies, ...GLOBAL });
  const rootSize = getRootSize(rawDescription);
  const description = freeze({ ...rawDescription, ...rootSize });
  
  // general
  GLOBAL.ALL_NODES = dependencies.ALL_NODES;
  GLOBAL.SELECT_ALL = dependencies.SELECT_ALL;

  // ui system (1/2)
	GLOBAL.SKETCH = getQ5Instance(description);
	GLOBAL.CAT_PAINTER = freeze(new CatPainter(getDependencies(), description));
  
  // rx system
	GLOBAL.EVENT_BUS = freeze(new EventBus(getDependencies(), allPipelines));
  GLOBAL.DISPATCHER = freeze(new PrimaryDispatcher(getDependencies()));
  GLOBAL.EMITTER = freeze(new PrimaryEmitter(getDependencies()));
  GLOBAL.DISPATCHER._runRxConection(GLOBAL.EMITTER);
  setNativeListeners(getDependencies());

  // ui system (2/2)
	GLOBAL.UI_ROOT = freeze(new UiRoot(getDependencies(), description));
  setSketchSetup(getDependencies(), description); // instance mutation!!!

  return freeze(GLOBAL); // only refereced by Registry
}
