import { checkStructure, genericLogger } from "./_debugOutput.js";

// "GLOBAL", "ALL_NODES", "ASSETS", "EVENT_BUS"

//////////////////////////////
//
const newRootCreated = (rootId, isTracked, global) => {
  genericLogger(rootId, `New root created`);
  if (isTracked) checkStructure(`the GLOBAL object`, global);
}

//////////////////////////////
//
const setupStarted = (rootId, isTracked, assets) => {
  genericLogger(rootId, `Setup execution started`);
  if (isTracked) checkStructure(`the ASSETS cache`, assets);
}

//////////////////////////////
//
const treeInitialized = (rootId, isTracked, allNodes) => {
  genericLogger(rootId, `Tree initialized successfully`);
  if (isTracked) checkStructure(`the ALL_NODES map`, allNodes);
}

//////////////////////////////
//
const cleanupEnded = (rootId, nodeId) => {
  genericLogger(rootId, `The garbage collector removed "${nodeId}" from memory`);
}

//////////////////////////////
//
export default {
  newRootCreated,
  setupStarted,
	treeInitialized,
  cleanupEnded,
}