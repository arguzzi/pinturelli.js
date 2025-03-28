import { typedParams, areNot } from "types.js";

export default {
  typedParams,
  instanceParam,
  constructorParams,
  unsubscribeParams,
  subscribeParams,
}

//////////////////////////////
//
function instanceParam(node, abstract) {
  if (!(node instanceof abstract)) {
    throw new Error(`Only instances of subclasses of "${abstract.name}" can be nested`);
  }
}

//////////////////////////////
//
function constructorParams(concret, abstract, GLOBAL, LOCAL){
  const {
    parent,
    id,
    localPosX, 
    localPosY, 
    localWidth, 
    localHeight, 
    depthLevel,
    ...FLAGS 
  } = LOCAL;

  if (concret === abstract) {
    throw new Error(`Cannot instantiate abstract class "${abstract.name}" directly`);
  }
  
  if (!parent || (parent !== GLOBAL.CONFIG.MAGIC_NUMBER && !(parent instanceof abstract))) {
    throw new Error(`Invalid parent: must be an instance of a subclass of "${abstract.name}"`);
  }

  if (parent !== GLOBAL.CONFIG.MAGIC_NUMBER && (areNot.number(parent.x, parent.y) !== -1)) {
    throw new Error(`Invalid position in parent: "${parent?.x}" and "${parent?.y}" must be numbers`);
  }

  if (GLOBAL.ALL_NODES.hasOwnProperty(id) || areNot.string(id) !== -1) {
    throw new Error(`Invalid id: "${id}" must be an unused string`);
  }

  if (areNot.number(localPosX, localPosY) !== -1) {
    throw new Error(`Invalid local position: "${localPosX}" and "${localPosY}" must be numbers`);
  }

  if (areNot.number(localWidth, localHeight) !== -1) {
    throw new Error(`Invalid local size: "${localWidth}" and "${localHeight}" must be numbers`);
  }

  if (depthLevel && areNot.number(depthLevel) !== -1) {
    throw new Error(`Invalid depth level: "${depthLevel}". If specified, must be a number`);
  }

  const flagsKeys = Object.keys(FLAGS);
  const flagsValues = Object.values(FLAGS);
  const flagsValidation = areNot.boolean(flagsValues);
  
  if (flagsValidation !== -1) {
    const flagName = flagsKeys[flagsValidation];
    throw new Error(`Invalid flag: "${flagName}". If set, must be a boolean`);
  }
}

//////////////////////////////
//
function unsubscribeParams(publisherId, eventName) {
  typedParams.string(publisherId, eventName);
}

//////////////////////////////
//
function subscribeParams(publisherId, eventName, callbacks) {
  unsubscribeParams(publisherId, eventName);

  if (
    !Array.isArray(callbacks) ||
    areNot.function(...callbacks) !== -1
  ) {
    throw new Error(`Callbacks must an array of functions`);
  }
}
