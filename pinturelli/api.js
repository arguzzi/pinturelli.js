import createGlobal from "./global/createGlobal.js";
import stateManagers from "./ui/stateManagers.js";
import UiGestures from "./ui/UiGestures.js";
import UiClasses from "./ui/UiClasses.js";
import Registry from "./Registry.js";

////////////////////////////
//
const registry = Object.freeze(new Registry({
  createGlobal,
  stateManagers,
  UiGestures,
  UiClasses,
}));

/* TO AVOID POLLUTING THE GLOBAL SCOPE: COMMENT OUT THESE LINES... */
window.pinturelliRoot = description => registry.pinturelliRoot(description);
window.pinturelliNode = d => registry.pinturelliNode(d); // d <-- description
window.pinturelliClone = (path, d) => registry.pinturelliClone(path, d);
window.pinturelliCloneAll = (p, d) => registry.pinturelliCloneAll(p, d);
window.pinturelliRiskySelect = p => registry.pinturelliRiskySelect(p);
window.pinturelliRiskySelectAll = p => registry.pinturelliRiskySelectAll(p);
window.pinturelliRiskyDestroy = p => registry.pinturelliRiskyDestroy(p);
window.pinturelliRiskyDestroyAll = p => registry.pinturelliRiskyDestroyAll(p);

/* ...AND UNCOMMENT THESE LINES HERE */
// export default {
// 	pinturelliRoot: registry.pinturelliRoot,
// 	pinturelliNode: registry.pinturelliNode,
//	pinturelliRiskySelect: registry.pinturelliRiskySelect,
//	pinturelliRiskySelectAll: registry.pinturelliRiskySelectAll,
//	pinturelliClone: registry.pinturelliClone,
//	pinturelliCloneAll: registry.pinturelliCloneAll,
// 	pinturelliRiskyDestroy: registry.pinturelliRiskyDestroy,
// 	pinturelliRiskyDestroyAll: registry.pinturelliRiskyDestroyAll,
// }
