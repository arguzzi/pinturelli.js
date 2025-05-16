import { checkStructure, genericLogger } from "./_debugOutput.js";

//////////////////////////////
//
const newRootCreated = (GLOBAL, rootId) => {
  genericLogger(rootId, `New root created`);
  checkStructure(`the GLOBAL-object`, GLOBAL);
}

//////////////////////////////
//
const initializeSeeds = (allNodes, rootId) => {
  genericLogger(rootId, `The root has been initialized successfully.`);
  checkStructure(`all nodes`, allNodes);
}

//////////////////////////////
//
const cleanupEnded = (rootId, nodeId) => {
  genericLogger(rootId, `The garbage collector successfully removed the node "${nodeId}" from memory.`);
}

//////////////////////////////
//
export default {
  newRootCreated,
	initializeSeeds,
  cleanupEnded,
}