import { testMode } from "../debug/_allModesFlags.js";
import validate from "../debug/testMode/validateGlobal.js";

import CatPainter from "./CatPainter.js";
import ReactionManager from "../rx/reactionManger.js";
import EventBus from "../rx/EventBus.js";
import PrimaryDispatcher from "../rx/PrimaryDispatcher.js";
import PrimaryEmitter from "../rx/PrimaryEmitter.js";
import UiRoot from "../ui/UiRoot.js";

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
export default (rawDependencies, rawDescription) => {
  if (testMode) {
    validate.params({ rawDependencies, rawDescription });
    validate.uiSystem({ CatPainter, UiRoot });
    validate.rxSystem({ EventBus, PrimaryDispatcher, PrimaryEmitter });
    validate.pipelines({ ...allPipelines });
  }

  const GLOBAL = {}; // will be freezed!!!
  const freeze = obj => Object.freeze(obj);
  const getDependencies = () => freeze({ ...rawDependencies, ...GLOBAL});
  const rootSize = rawDependencies._rootManagers.getRootSize(rawDescription);
  const description = freeze({ ...rawDescription, ...rootSize });
  
  // general
  GLOBAL.ALL_NODES = rawDependencies.ALL_NODES;
  GLOBAL.SELECT_ALL = rawDependencies.SELECT_ALL;
	GLOBAL.SKETCH = getQ5Instance(description);
  
  // rx system
  GLOBAL.RX_MANAGER = freeze(new ReactionManager(getDependencies()));
	GLOBAL.EVENT_BUS = freeze(new EventBus(getDependencies()));
  GLOBAL.DISPATCHER = freeze(new PrimaryDispatcher(getDependencies()));
  GLOBAL.EMITTER = freeze(new PrimaryEmitter(getDependencies(), allPipelines));
  setNativeListeners(getDependencies());
  
  // ui system
	GLOBAL.UI_ROOT = freeze(new UiRoot(getDependencies(), description));
	GLOBAL.CAT_PAINTER = freeze(new CatPainter(getDependencies(), description));
  setSketchSetup(getDependencies(), description);

  return freeze(GLOBAL); // only refereced by Registry
}
