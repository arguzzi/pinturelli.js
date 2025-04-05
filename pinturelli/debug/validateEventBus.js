import { areNotAt, typedParams } from "./validateTypes.js";
import { throwError } from "./debuggerOutput.js";

//////////////////////////////
//
function pubParams({ ALL_NODES }, pubId, event) {
  typedParams.string(event);

  if (!ALL_NODES.has(pubId)) {
    throwError(`Event Bus`, `Every publisher must be a valid node. "${pubId}" not found`);
  }
}

//////////////////////////////
//
function subParams({ ALL_NODES }, pubId, event, subId, callbacks) {
  unsubParams({ ALL_NODES }, pubId, event, subId);

  const areNotAtFn = areNotAt.function(...callbacks);
  if (!Array.isArray(callbacks) || areNotAtFn !== -1) {
    throwError(`Event Bus`, `For chained execution, "callbacks" must be an array of functions. Invalid function at index ${areNotAtFn}`);
  }
}

//////////////////////////////
//
function unsubParams({ ALL_NODES }, pubId, event, subId) {
  pubParams({ ALL_NODES }, pubId, event);

  if (!ALL_NODES.has(subId)) {
    throwError(`Event Bus`, `Every subscriber must be a valid node. "${subId}" not found`);
  }
}

//////////////////////////////
//
export default {
  pubParams,
  subParams,
  unsubParams,
  typedParams,
}