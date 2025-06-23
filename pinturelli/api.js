import { setApiErrors, setCheckpoints } from "./debug/_allModesFlags.js";
import { firstLog } from "./debug/_debugOutput.js";

import Registry from "./Registry.js";

////////////////////////////
//
const { searchParams } = new URL(import.meta.url);
const windowScope = !searchParams.has("noWindow");
const flagDebugMode = !searchParams.has("finalMode");
const flagApiErrors = flagDebugMode && !searchParams.has("noErrors");

setCheckpoints(flagDebugMode);
setApiErrors(flagApiErrors);
firstLog(flagDebugMode, flagApiErrors);

////////////////////////////
//
const REG = Registry._getSingleton();

// global scope, as script for development: 
// <script src="./pinturelli.js" type="module"></script>
// ...or as script for production:
// <script src="./pinturelli.js?finalMode" type="module"></script>
if (windowScope) {
  window.pinturelliConfig = configs => REG._pinturelliConfig(configs);
  window.pinturelliRoot = description => REG._pinturelliRoot(description);
  window.pinturelliNode = d => REG._pinturelliNode(d); // d <-- description
  window.pinturelliClone = (path, d) => REG._pinturelliClone(path, d);
  window.pinturelliCloneAll = (p, d) => REG._pinturelliCloneAll(p, d);
  window.pinturelliRiskySelect = p => REG._pinturelliRiskySelect(p);
  window.pinturelliRiskySelectAll = p => REG._pinturelliRiskySelectAll(p);
  window.pinturelliRiskyDestroy = p => REG._pinturelliRiskyDestroy(p);
  window.pinturelliRiskyDestroyAll = p => REG._pinturelliRiskyDestroyAll(p);
}

// named exports, as module for development:
// import { pinturelliRoot, pinturelliNode } from "./pinturelli.js?noWindow";
// ...or as module for production:
// import { pinturelliRiskyDestroy } from "./pinturelli.js?noWindow&finalMode";
export const pinturelliConfig = c => REG._pinturelliConfig(c);
export const pinturelliRoot = d => REG._pinturelliRoot(d);
export const pinturelliNode = d => REG._pinturelliNode(d);
export const pinturelliClone = (p, d) => REG._pinturelliClone(p, d);
export const pinturelliCloneAll = (p, d) => REG._pinturelliCloneAll(p, d);
export const pinturelliRiskySelect = p => REG._pinturelliRiskySelect(p);
export const pinturelliRiskySelectAll = p => REG._pinturelliRiskySelectAll(p);
export const pinturelliRiskyDestroy = p => REG._pinturelliRiskyDestroy(p);
export const pinturelliRiskyDestroyAll = p => REG._pinturelliRiskyDestroyAll(p);

// instanced export, as module for development:
// import pinturelli from "./pinturelli.js?noWindow";
// ...or as module for production:
// import pinturelli from "./pinturelli.js?noWindow&finalMode";
export default {
  config: c => REG._pinturelliConfig(c),
  root: d => REG._pinturelliRoot(d),
  node: d => REG._pinturelliNode(d),
  clone: (p, d) => REG._pinturelliClone(p, d),
  cloneAll: (p, d) => REG._pinturelliCloneAll(p, d),
  riskySelect: p => REG._pinturelliRiskySelect(p),
  riskySelectAll: p => REG._pinturelliRiskySelectAll(p),
  riskyDestroy: p => REG._pinturelliRiskyDestroy(p),
  riskyDestroyAll: p => REG._pinturelliRiskyDestroyAll(p),
}
