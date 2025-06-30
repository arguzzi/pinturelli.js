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
const cleanupStarted = (rootId, nodeId, done) => {
  if (done) genericLogger(rootId, `All references to "${nodeId}" were removed from the Registry...`);
  else genericLogger(rootId, `Failed removing references of "${nodeId}" from the Registry!!!`);
}

//////////////////////////////
//
const cleanupEnded = (rootId, nodeId) => {
  genericLogger(rootId, `Successfully cleaned up the node "${nodeId}" from the memory`);
}

//////////////////////////////
//
const unsafeIteration = (path, selected, stop) => {
  const rootId = selected?.[0]?.rootId;
  const info = { path, actualBatch: selected?.length, ...stop };
  genericLogger(rootId, `Selection exceeded safe iteration limits`);
  checkStructure(`the details`, info);
}

//////////////////////////////
//
const missingNode = (origin, path) => {
  genericLogger(origin, `Missing node at path: "${path}"`);
}

//////////////////////////////
//
const removedDeadId = nodeId => {
  genericLogger("Registry", `Dead id "${nodeId}" was found and removed from the Registry`);
}

//////////////////////////////
//
export default {
  newRootCreated,
  setupStarted,
	treeInitialized,
  cleanupStarted,
  cleanupEnded,
  unsafeIteration,
  missingNode,
  removedDeadId,
}