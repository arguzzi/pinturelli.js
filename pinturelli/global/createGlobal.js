import runSketch from "./runSketch.js";
import { calculateSize } from "../ui/calculateBox.js";
import ignoredSetup from "./ignoredSetup.js";
import loadAssets from "./loadAssets.js";
import CatPainter from "./CatPainter.js";
import EventBus from "../rx/EventBus.js";
import PrimaryDispatcher from "../rx/PrimaryDispatcher.js";
import gesturesPipeline from "../rx/pipelines/gesturesIndex.js";
import contextPipeline from "../rx/pipelines/contextIndex.js";
import PrimaryEmitter from "../rx/PrimaryEmitter.js";
import setNativeListeners from "../rx/setNativeListeners.js";
import UiRoot from "../ui/UiRoot.js";

const pipelines = { gesturesPipeline, contextPipeline };
const freeze = obj => Object.freeze(obj);

////////////////////////////
//
// dependencies
// allNodes: this.#allNodesProxyCreator(rootId),
// treeInitializer: () => this.#initializeSeeds(rootId),
// selectAll: this.pinturelliRiskySelectAll.bind(this),
// _getFollowerIds: () => (
//   Object.freeze(Array.from(this.#allFollowers.get(rootId)))
// ),
export default (dependencies, description) => {
  const GLOBAL = {}; // will be freezed!!!
  const newDependencies = { ...dependencies, GLOBAL };
  const setupDependencies = { ...newDependencies, loadAssets, ignoredSetup };
  const { resolutionX, resolutionY, proportion } = description;
  const sizeInput = { width: resolutionX, heigth: resolutionY, proportion };
  const newDescription = { ...description, ...calculateSize(sizeInput) };
  
  // general
	GLOBAL.SKETCH = runSketch(setupDependencies, newDescription);
	GLOBAL.CAT_PAINTER = freeze(new CatPainter(newDependencies, newDescription));

  // events
	GLOBAL.EVENT_BUS = freeze(new EventBus(newDependencies, pipelines));
  GLOBAL.DISPATCHER = freeze(new PrimaryDispatcher(newDependencies));
  GLOBAL.EMITTER = freeze(new PrimaryEmitter(newDependencies));
  GLOBAL.DISPATCHER._setupConection(GLOBAL.EMITTER);
  setNativeListeners(newDependencies);

  // output
	GLOBAL.UI_ROOT = freeze(new UiRoot(newDependencies, newDescription));
  return freeze(GLOBAL); // only refereced by registry
}
