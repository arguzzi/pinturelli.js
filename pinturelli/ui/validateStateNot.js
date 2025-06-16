import { throwError } from "../debug/_debugOutput.js";
import { typedParams } from "../debug/_typeValidators.js";

/////////////////////////////
//
const validateLabels = (labels, nodeId) => {
  typedParams.array(`API pinturelliNode (state "labels" for "${nodeId}")`, labels);
  typedParams.string(`API pinturelliNode (state "labels" for "${nodeId}")`, ...labels);

  for (const label of labels) {
    if (/^\.[a-zA-Z][A-Z0-9_-]*$/.test(label)) continue;
    throwError(`API pinturelliNode (state "labels" values for "${nodeId}")`, `Labels must start with ".", then a letter. Subsequent characters, if any, must be letters, digits, hyphens (-) or underscores (_). Invalid label: "${label}"`);
  }
}

/////////////////////////////
//
const validateFollowingId = (followingId, nodeId, rootId) => {
  typedParams.string(`API pinturelliNode (state "followingId" for "${nodeId}")`, followingId);
  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(followingId) || followingId === rootId) return;
  throwError(`API pinturelliNode (state "followingId" for "${nodeId}")`, `If not a root id, the followed id must start with "#", then a letter. Subsequent characters, if any, must be letters, digits, hyphens (-) or underscores (_). Invalid id: "${followingId}"`);
}

/////////////////////////////
//
const validatePosition = (state, nodeId) => {
  if (state.left === null && state.right === null) {
    throwError(`API pinturelliNode (horizontal position states for "${nodeId}")`, `At least one of "left" or "right" must be provided`);
  }
  if (state.top === null && state.bottom === null) {
    throwError(`API pinturelliNode (vertical position states for "${nodeId}")`, `At least one of "top" or "bottom" must be provided`);
  }
  if (state.offsetX === null || state.offsetY === null) {
    throwError(`API pinturelliNode (position states for "${nodeId}")`, `Neither "offsetX" nor "offsetY" can be null. Use 0 for no offset at all`);
  }
}

/////////////////////////////
//
const validateProportion = (proportion, nodeId) => {
  if (proportion === null) return;
  typedParams.number(`API pinturelliNode (state "proportion" for "${nodeId}")`, proportion);
  if (proportion >= 0) return;
  throwError(`API pinturelliNode (state "proportion" for "${nodeId}")`, `If specified, proportion must be a non-negative number`);
}

/////////////////////////////
//
const validateSize = (state, nodeId) => {
  const isWidthSetByPosition = state.left !== null && state.right !== null;
  const isHeightSetByPosition = state.top !== null && state.bottom !== null;
  const isWidthMissing = !isWidthSetByPosition && state.width === null;
  const isHeightMissing = !isHeightSetByPosition && state.height === null;
  if (isWidthMissing && isHeightMissing) {
    throwError(`API pinturelliNode (size states for "${nodeId}")`, `At least one of "width" or "height" must be provided (directly or via positioning)`);
  }
  
  validateProportion(state.proportion, nodeId);
  if ((isWidthMissing || isHeightMissing) && state.proportion === null) {
    throwError(`API pinturelliNode (state "proportion" for "${nodeId}")`, `The "proportion" must be a non-negative number when either "width" or "height" is not provided`);
  }
}

/////////////////////////////
//
export const validateState = (state, nodeId, rootId) => {
  typedParams.plainObject(`API pinturelliNode (state declaration for "${nodeId}")`, state);

  // labels
  validateLabels(state.labels, nodeId);

  // following id
  validateFollowingId(state.followingId, nodeId, rootId);

  // generic typed keys
  const typeTargetsMap = new Map([
    ["boolean", ["treeVisibile", "nodeVisibile"]],
    ["number", ["originX", "originY", "treeLayer", "nodeLayer"]],
    ["string", ["painting", "overlayedPainting"]],
  ]);
  for (const [typeTarget, targetKeys] of typeTargetsMap) {
    const targetValues = targetKeys.map(key => state[key]);
    typedParams[typeTarget](`API pinturelliNode (state ${typeTarget}-typed keys for "${nodeId}")`, ...targetValues);
  }

  // numeric or pseudo css keys
  const sizeKeys = ["width", "height"];
  const distanceKeys = [...sizeKeys, "left", "right", "top", "bottom", "offsetX", "offsetY"];
  for (const distanceKey of distanceKeys) {
    const distanceValue = state[distanceKey];
    if (distanceValue === null) continue; // nulled ok

    // numeric
    if (typeof distanceValue === "number") {
      if (!sizeKeys.includes(distanceKey)) continue; // any sign ok
      if (distanceValue >= 0) continue; // not negative ok
      throwError(`API pinturelliNode (state numeric-size-keys for "${nodeId}")`, `Numeric values of "width" and "height" must be positive. Invalid state: "${distanceKey}: ${distanceValue}"`);
    }

    // pseudo css
    console.log(distanceKey, distanceValue)
    typedParams.string(`API pinturelliNode (state pseudo-css-keys for "${nodeId}")`, distanceValue);
    if (sizeKeys.includes(distanceKey)) {
      const notNegativeUnit = /^(?:\.\d+|\d+\.\d+|\d+%|\d+px|\d+(?:\.\d+)?rem)$/;
      if (notNegativeUnit.test(distanceValue)) continue; // format and not negative ok
      throwError(`API pinturelliNode (state for "${nodeId}") pseudo-css-size-keys in state`, `String values of "width" and "height" must be like: ".1" "0.1" "1%" "1px" "1rem" "0.1rem" (and always positive). Invalid state: "${distanceKey}: ${distanceValue}"`);
    }
    const anySignUnit = /^-?(?:\.\d+|\d+\.\d+|\d+%|\d+px|\d+(?:\.\d+)?rem)$/;
    if (anySignUnit.test(distanceValue)) continue; // format and any sign ok
    throwError(`API pinturelliNode (state for "${nodeId}") pseudo-css-keys in state`, `String values of distance keys must be like: ".1" "0.1" "1%" "1px" "1rem" "0.1rem" (positive or negative). Invalid state: "${distanceKey}: ${distanceValue}"`);
  }

  // position (left, right, top, bottom, offsetX, offsetY)
  validatePosition(state, nodeId);

  // size (width, height, proportion)
  validateSize(state, nodeId);
}

/////////////////////////////
//
export default {
  validateLabels,
  validateFollowingId,
  validatePosition,
  validateProportion,
  validateSize,
  validateState,
}