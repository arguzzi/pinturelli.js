import { areNot, areNotAt, typedParams } from "./_typeValidators.js";
import { throwError } from "./_debugOutput.js";

//////////////////////////////
//
const registryConstructor = (secretKey, singletonKey) => {
  if (secretKey === singletonKey) return;
  throwError(`Registry (constructor)`, `Pinturelli's memory cannot be instantiated directly. Use "Registry.getSingleton()" to access the instance.`);
}

//////////////////////////////
//
const pinturelliRoot = (allRoots, rootId) => {
  typedParams.string(`pinturelliRoot (1st argument) -> rootId`, rootId);
  if (!rootId.startsWith("_")) throwError(`pinturelliRoot (1st argument)`, `Id "${rootId}" must be a string starting with "_".`);
  if (allRoots.has(rootId)) throwError(`pinturelliRoot (1st argument)`, `Id "${rootId}" is already registered to a different root instance. Each root must have a unique identifier`);
}

//////////////////////////////
//
const pinturelliNode = (description, allRoots, allNodesByRoot) => {
  const rootId = description?.rootId;
  const rootNodesMap = allNodesByRoot.get(rootId)
  if (!allRoots.has(rootId) || !rootNodesMap) throwError(`pinturelliNode (1st argument)`, `The description must have a key "root" with `);
  const nodeId = description?.nodeId;
  if (rootNodesMap.has(nodeId)) throwError(`pinturelliNode (1st argument)`, `The description must have a key "root" with `);
}

//////////////////////////////
//
const nodeIdValidator = (newId, allNodes) => {
}

//////////////////////////////
//
const selectSyntax = (path, problem, prefix) => {
}

//////////////////////////////
//
const selectOrigin = (path, problem, selector) => {
}

//////////////////////////////
//
const selectBeyondRoot = (path) => {
  // 
}

//////////////////////////////
//
const selectNoAccumulated = (path) => {
  // 
}

//////////////////////////////
//
const runInitialization = () => {
  // check tree structure
  // search lost nodes
}

//////////////////////////////
//
const addNode = (description, uiClasses) => {
  if (description?.UiClass === undefined) return;
  if (Object.hasOwn(uiClasses, description.UiClass)) return;
  throwError(`pinturelliRoot (1st argument)`, `If "UiClass" is specified: must be the name of an existing class in "ui/classes" subdirectory, and exported from "UiClasses.js" module.`);
}

//////////////////////////////
//
export default {
  registryConstructor,
  pinturelliRoot,
  pinturelliNode,
  nodeIdValidator,
  selectSyntax,
  selectOrigin,
  selectBeyondRoot,
  selectNoAccumulated,
  runInitialization,
  addNode,
}