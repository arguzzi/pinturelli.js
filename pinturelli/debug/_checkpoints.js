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
const setupStarted = (rootId, isTracked, allAssets) => {
  genericLogger(rootId, `Setup execution started`);
  if (isTracked) checkStructure(`the loaded ASSETS`, allAssets);
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
  genericLogger(rootId, `Successfully removed "${nodeId}" from memory`);
}

//////////////////////////////
//
const unsafeIteration = (path, accumulator, stop) => {
  const selected = accumulator.newSelected;
  const rootId = selected?.[0]?.rootId;
  const info = { path, actualBatch: selected.length, ...stop };
  genericLogger(rootId, `Selection exceeded safe iteration limits`);
  checkStructure(`the iteration info`, info);
}

//////////////////////////////
//
const missingNode = (origin, path) => {
  genericLogger(origin, `Missing node at path: "${path}"`);
}

//////////////////////////////
//
export default {
  newRootCreated,
  setupStarted,
	treeInitialized,
  cleanupEnded,
  unsafeIteration,
  missingNode,
}