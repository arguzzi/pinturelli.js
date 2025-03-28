import { typedParams, areNot } from "types.js";

export default {
  pubParams,
  subParams,
  unsubParams,
}

//////////////////////////////
//
function pubParams({ ALL_NODES }, pubId, event) {
  typedParams(event);

  if (!ALL_NODES.has(pubId)) {
    throw new Error(`Publisher must be a valid node. "${pubId}" not found`);
  }
}

//////////////////////////////
//
function subParams({ ALL_NODES }, pubId, event, subId, callbacks) {
  unsubParams({ ALL_NODES }, pubId, event, subId);

  const areNotFn = areNot.function(...callbacks);
  
  if (!Array.isArray(callbacks) || areNotFn !== -1) {
    throw new Error(`Invalid function at index ${areNotFn} ("callbacks" must an array of functions)`);
  }
}

//////////////////////////////
//
function unsubParams({ ALL_NODES }, pubId, event, subId) {
  pubParams({ ALL_NODES }, pubId, event);

  if (!ALL_NODES.has(subId)) {
    throw new Error(`Subscriber must be a valid node. "${subId}" not found`);
  }
}