import dbgr from "../debug/validateSketch.js";
import { logger, checkNodes } from "../debug/debuggerOutput.js";

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

export default function loadAndRunSketch(GLOBAL) {
  const { CONFIG, ALL_NODES } = GLOBAL;
  const { DEBUG, Q5_CONFIG, CANVAS } = CONFIG;

  // reminder:
  // Q5_CONFIG = {parentId, alpha, displayModeArgs, originalFrameRate}
  const parentElement = document.getElementById(Q5_CONFIG.parentId);
  const q5 = parentElement ? new Q5("instance", parentElement)
    : new Q5("instance");

  //____________
  // reminder:
  // node._assets = {source: [load, callback], source: [load, callback], ...}
  // to--> finalAssets = {source: Object_loaded, source: Object_loaded, ...}
  q5.preload = function() {
    if (DEBUG) {
      dbgr.checkInitialAssets({ ALL_NODES });

      // # log here *.*
      logger(CONFIG, "Preload execution started.");
    }

    const temporalCache = {}; // temporalCache = as finalAssets estructure
    
    for (const [_, node] of ALL_NODES) {
      
      // if no assets, skip this node
      if (Object.keys(node.ASSETS).length === 0) continue;

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

    if (DEBUG) dbgr.checkFinalAssets({ ALL_NODES });
  }

  //____________
  q5.setup = function() {
    CANVAS._elt = q5.createCanvas(
      CANVAS.resolutionX,
      CANVAS.resolutionY, {
      alpha: Q5_CONFIG.alpha }
    );

    q5.displayMode(...Q5_CONFIG.displayModeArgs);
    q5.frameRate(Q5_CONFIG.originalFrameRate);
    // q5.noLoop();

    // # log here *.*
    if (!DEBUG) return
    logger(CONFIG, "Setup completed.");
    checkNodes(ALL_NODES);
  }

  //____________
  return q5;
}
