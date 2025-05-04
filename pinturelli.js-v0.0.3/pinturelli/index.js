import createGlobal from "./global/createGlobal.js";

// reminder:
// --------------
//
//  options = {
//    debugMode: <boolean>,
//    parentId: <string>,
//    noAlpha: <boolean>,
//    displayModeArgs: <array>,
//    frameRate: <number>
//  }
//
// --------------

let instance = 0;

// USER API <> ENTRY POINT
window.createPinturelli = function(resolution, options) {
  const GLOBAL = createGlobal(resolution, options, instance++);
  return GLOBAL.UI_ROOT;
};
