import { areNot, areNotAt, typedParams } from "./_typeValidators.js";
import { throwError } from "./_debugOutput.js";

//////////////////////////////
//
function constructorParams({ GLOBAL, LOCAL }, concret, abstract){
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
    throwError(`Ui core`, `Cannot instantiate abstract class "${abstract.name}" directly`);
  }
  
  if (!parent || (parent !== GLOBAL.CONFIG.MAGIC_NUMBER && !(parent instanceof abstract))) {
    throwError(`Ui core`, `Invalid parent: must be an instance of a subclass of "${abstract.name}"`);
  }

  if (parent !== GLOBAL.CONFIG.MAGIC_NUMBER && areNot.number(parent.x, parent.y)) {
    throwError(`Ui core`, `Invalid position in parent: "${parent?.x}" and "${parent?.y}" must be numbers`);
  }

  if (Object.hasOwn(GLOBAL.ALL_NODES, id) || areNot.string(id)) {
    throwError(`Ui core`, `Invalid id: "${id}" must be an unused string`);
  }

  if (areNot.number(localPosX, localPosY)) {
    throwError(`Ui core`, `Invalid local position: "${localPosX}" and "${localPosY}" must be numbers`);
  }

  if (areNot.number(localWidth, localHeight)) {
    throwError(`Ui core`, `Invalid local size: "${localWidth}" and "${localHeight}" must be numbers`);
  }

  if (depthLevel && areNot.number(depthLevel)) {
    throwError(`Ui core`, `Invalid depth level: "${depthLevel}". If specified, must be a number`);
  }

  const flagsKeys = Object.keys(FLAGS);
  const flagsValues = Object.values(FLAGS);
  const flagsValidation = areNotAt.boolean(...flagsValues);

  if (flagsValidation !== -1) {
    const flagName = flagsKeys[flagsValidation];
    throwError(`Ui core`, `Invalid flag: "${flagName}". If specified, must be a boolean`);
  }
}

//////////////////////////////
//
function publishParams(eventName) {
  typedParams.string("Ui core (publish -> Event Bus)", eventName);
}

//////////////////////////////
//
function subscribeParams(GLOBAL, publisherId, eventName, callbacks) {
  typedParams.string("Ui core (subscribe -> Event Bus)", publisherId, eventName);
  
  if (!Array.isArray(callbacks) || areNot.function(...callbacks)) {
    throwError(`Ui core`, `For Event Bus subscription, callbacks must be an array of functions. Invalid at index: ${areNotAt.function(...callbacks)}`);
  }
}

//////////////////////////////
//
function unsubscribeParams(publisherId, eventName) {
  typedParams.string("Ui core (unsubscribe -> Event Bus)", publisherId, eventName);
}

//////////////////////////////
//
export default {
  typedParams,
  constructorParams,
  publishParams,
  subscribeParams,
  unsubscribeParams,
}
