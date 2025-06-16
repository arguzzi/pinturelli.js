import { setApiErrors, setCheckpoints } from "./debug/_allModesFlags.js";
import { firstLog } from "./debug/_debugOutput.js";

import createGlobal from "./global/createGlobal.js";
import stateManagers from "./ui/stateManagers.js";
import UiGestures from "./ui/UiGestures.js";
import UiClasses from "./ui/UiClasses.js";
import Registry from "./Registry.js";

////////////////////////////
//
const reg = Object.freeze(Registry.getSingleton({
  createGlobal,
  stateManagers,
  UiGestures,
  UiClasses,
}));

////////////////////////////
//
const { searchParams } = new URL(import.meta.url);
const flagDebugMode = !searchParams.has("finalMode");
const flagApiErrors = flagDebugMode && !searchParams.has("noErrors");
setCheckpoints(flagDebugMode);
setApiErrors(flagApiErrors);
firstLog(flagDebugMode, flagApiErrors);

// global scope, as script for development: 
// <script src="./pinturelli.js" type="module"></script>
// ...or as script for production:
// <script src="./pinturelli.js?finalMode" type="module"></script>
if (!searchParams.has("noWindow")) {
  window.pinturelliRoot = description => reg.pinturelliRoot(description);
  window.pinturelliNode = d => reg.pinturelliNode(d); // d <-- description
  window.pinturelliClone = (path, d) => reg.pinturelliClone(path, d);
  window.pinturelliCloneAll = (p, d) => reg.pinturelliCloneAll(p, d);
  window.pinturelliRiskySelect = p => reg.pinturelliRiskySelect(p);
  window.pinturelliRiskySelectAll = p => reg.pinturelliRiskySelectAll(p);
  window.pinturelliRiskyDestroy = p => reg.pinturelliRiskyDestroy(p);
  window.pinturelliRiskyDestroyAll = p => reg.pinturelliRiskyDestroyAll(p);
}

// named exports, as module for development:
// import { pinturelliRoot, pinturelliNode } from "./pinturelli.js?noWindow";
// ...or as module for production:
// import { pinturelliRiskyDestroy } from "./pinturelli.js?noWindow&finalMode";
export const pinturelliRoot = d => reg.pinturelliRoot(d);
export const pinturelliNode = d => reg.pinturelliNode(d);
export const pinturelliClone = (p, d) => reg.pinturelliClone(p, d);
export const pinturelliCloneAll = (p, d) => reg.pinturelliCloneAll(p, d);
export const pinturelliRiskySelect = p => reg.pinturelliRiskySelect(p);
export const pinturelliRiskySelectAll = p => reg.pinturelliRiskySelectAll(p);
export const pinturelliRiskyDestroy = p => reg.pinturelliRiskyDestroy(p);
export const pinturelliRiskyDestroyAll = p => reg.pinturelliRiskyDestroyAll(p);

// instanced export, as module for development:
// import pinturelli from "./pinturelli.js?noWindow";
// ...or as module for production:
// import pinturelli from "./pinturelli.js?noWindow&finalMode";
export default {
  root: d => reg.pinturelliRoot(d),
  node: d => reg.pinturelliNode(d),
  clone: (p, d) => reg.pinturelliClone(p, d),
  cloneAll: (p, d) => reg.pinturelliCloneAll(p, d),
  riskySelect: p => reg.pinturelliRiskySelect(p),
  riskySelectAll: p => reg.pinturelliRiskySelectAll(p),
  riskyDestroy: p => reg.pinturelliRiskyDestroy(p),
  riskyDestroyAll: p => reg.pinturelliRiskyDestroyAll(p),
};
