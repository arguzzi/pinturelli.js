import flag from "../debug/_errorAndLogFlags.js";
import { genericLogger } from "../debug/_debugOutput.js";

// import dbgr from "../debug/validateSketch.js";
// import { logger, checkNodes } from "../debug/_debugOutput.js";

//////////////////////////////
//
// q5.js global functions
// 
// in preload:
// from initial assets...
// --------------
//
//  node._assets = {
//    source<STRING>: <ARRAY[<FUNCTION>(load), <FUNCTION/UNDEFINED>(callback)]>,
//    source<STRING>: <ARRAY[<FUNCTION>(load), <FUNCTION/UNDEFINED>(callback)]>,
//    source<STRING>: <ARRAY[<FUNCTION>(load), <FUNCTION/UNDEFINED>(callback)]>,
//  }
//
// --------------
// ...to final assets --> mutation
// --------------
// 
//  node._assets = {
//    source<STRING>: <OBJECT>(Object_loaded),
//    source<STRING>: <OBJECT>(Object_loaded),
//    source<STRING>: <OBJECT>(Object_loaded),
//  }
//
// --------------
//
// in setup:
// canvas creation and general configuration.
// displayMode("maxed"), noLoop(), clear() are mandatory
//
//////////////////////////////

export default function loadAndRunSketch({ allNodesProxy: allNodes, initializer }, description) {
  const debug = description.memoryLogs;

  const { rootId, containerId } = description;
  const hasContainer = containerId !== "";
  const getContainer = () => document.querySelector(`#${containerId}`);
  const q5 = hasContainer
  ? new Q5("instance", getContainer())
  : new Q5("instance");

  //____________
  // reminder:
  // node._assets = {source: [load, callback], source: [load, callback], ...}
  // to--> finalAssets = {source: Object_loaded, source: Object_loaded, ...}
  q5.preload = function() {
    if (flag.log) genericLogger(rootId, `Preload execution started`);
      // dbgr.checkInitialAssets({ ALL_NODES: allNodes });
      // logger(CONFIG, "Preload execution started."); // # log here *.*
    
    initializer();

    const temporalCache = {}; // temporalCache = as finalAssets estructure
    
    for (const [_, node] of Object.entries(allNodes)) {
      
      // if no assets, skip this node
      // if (Object.keys(node.ASSETS).length === 0) continue;
      if (0 === 0) continue;

      // temporal loaded results
      const finalAssets = {};

      // node._assets[source] = [load, callback]
      Object.keys(node._assets).forEach(source => {
        if (temporalCache[source]) {
          finalAssets[source] = temporalCache[source];
          return;
        };

        const loadSystem = node._assets[source];
        finalAssets[source] = q5.loadSystem[0](loadSystem[1]);
        temporalCache[source] = finalAssets[source];
      });

      node._assets = finalAssets;
    }

    // if (debug) dbgr.checkFinalAssets({ ALL_NODES: allNodes });
  }

  //____________
  q5.setup = function() {
    const CANVAS = {};
    CANVAS._elt = q5.createCanvas(
      // CANVAS.resolutionX,
      // CANVAS.resolutionY,
      200, 200,
      { alpha: true }
    );

    // q5.displayMode(...Q5_CONFIG.displayModeArgs);
    q5.displayMode(q5.MAXED);
    // q5.frameRate(Q5_CONFIG.originalFrameRate);
    q5.frameRate(60);
    // q5.noLoop();
    
    // # log here *.*
    // if (!debug) return
    // logger(CONFIG, "Setup completed.");
    // checkNodes(allNodes);
  }

  //____________
  return q5;
}
