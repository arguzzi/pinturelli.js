import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/managers.js";

import expansions from "../global/symbolExpansions.js";

////////////////////////////
//
// utilities
const trunc = Math.trunc;
const safeDivide = (a, b) => b === 0 ? 0 : a / b;
const cloneIfNeeded = value => {
  if (typeof value !== "object" || value === null) return value;
  try { return structuredClone(value) } catch (error) { 
    // see "the structured clone algorithm" in "mdn web docs"
    if (flag.err) apiErrors.cloning(value, error);
  }
}

////////////////////////////
//
const matrixParser = (stateValue, followingOutput, rootInfo) => {
  if (typeof stateValue === "number") return stateValue; // numeric
  if (stateValue === null) return followingOutput; // nothing to change

  // if (flag.err) must be a string of: digits + units

  // percent
  if (stateValue.endsWith("%")) {
    const numericValue = parseFloat(stateValue);
    return trunc((numericValue / 100) * followingOutput);
  }

  // SOON...
  // using rootInfo: pseudo css units
  // "1.1px" "1px"
  // "1.1rem" "1rem"
  // "1.1vw" "1vw"
  // "1.1vh" "1vh"
}

////////////////////////////
//
// 0. SIDE EFFECT
const setFollowing = ({ node, following }, patchedState) => {
  const newFollowingId = patchedState.following_id;

  // mutation!!!
  node._patchRawState("following_id", newFollowingId);
  node._patchRawOutput("FOLLOWING", following._outputManager);

  return {
    outputWasChanged: true,
    callNextHandler: true,
    keepEffectAlive: false,
  }
}

//____________
// 1. SIDE EFFECT
const setPosition = (dependencies, patchedState, newPatchedState) => {
  const { node, following, rootInfo } = dependencies;
  const targetStates = {
    left: null,
    right: null,
    top: null,
    bottom: null
  }

  let outputWasChanged = false;
  for (const key of Object.keys(targetStates)) {
    const KEY = key.toUpperCase();
    const lastValue = node._getRawState(key);
    const newValue = patchedState[key] ?? lastValue;
    const hasValue = newValue !== null;
    const lastOutput = node._getRawOutput(KEY);
    const followingOutput = following._getRawOutput(KEY);
    
    // mutation!!! each case
    const localValue = matrixParser(newValue, followingOutput, rootInfo);
    const newOutput = followingOutput + localValue;
    const wasChanged = newOutput !== lastOutput;
    wasChanged = wasChanged || wasChanged;
    targetStates[key] = hasValue;
    node._patchRawState(key, newValue);
    if (!wasChanged) continue;
    node._patchRawOutput(KEY, newOutput);
  }
  newPatchedState._hasFixedWidth = targetStates.left && targetStates.right;
  newPatchedState._hasFixedHeight = targetStates.top && targetStates.bottom;

  return {
    outputWasChanged,
    callNextHandler: outputWasChanged,
    keepEffectAlive: true,
  }
}

//____________
// 2. SIDE EFFECT
const setBoxSize = (dependencies, patchedState, newPatchedState) => {
  const { node, following, rootInfo } = dependencies;
  const lastWidth = node._getRawState("width");
  const lastHeight = node._getRawState("height");
  const lastProportion = node._getRawState("proportion");
  const newWidth = patchedState.width ?? lastWidth;
  const newHeight = patchedState.height ?? lastHeight;
  const newProportion = patchedState.proportion ?? lastProportion;
  const hasFixedWidth = newPatchedState._hasFixedWidth;
  const hasFixedHeight = newPatchedState._hasFixedHeight;
  const lastOutputLeft = node._getRawState("left");
  const lastOutputRight = node._getRawState("right");
  const lastOutputTop = node._getRawState("top");
  const lastOutputBottom = node._getRawState("bottom");
  const lastOutputWidth = node._getRawState("width");
  const lastOutputHeight = node._getRawState("height");

  // mutation!!! all cases
  node._patchRawState("width", newWidth);
  node._patchRawState("height", newHeight);
  node._patchRawState("proportion", newProportion);
  const handleMutation = (width, height, proportion = newProportion) => {
    const widthWasChanged = width !== lastOutputWidth;
    const heigthWasChanged = height !== lastOutputHeight;
    const outputWasChanged = widthWasChanged || heigthWasChanged;
    node._patchRawOutput("WIDTH", width);
    node._patchRawOutput("HEIGHT", height);
    node._patchRawOutput("PROPORTION", proportion);
    newPatchedState._boxSizeChanged = outputWasChanged;
    return {
      outputWasChanged,
      callNextHandler: outputWasChanged,
      keepEffectAlive: true,
    }
  }

  // fixed size case
  if (hasFixedWidth && hasFixedHeight) {
    const newOutputWidth = lastOutputRight - lastOutputLeft;
    const newOutputHeight = lastOutputBottom - lastOutputTop;
    const newOutputProportion = safeDivide(newOutputWidth, newOutputHeight);
    return handleMutation(newOutputWidth, newOutputHeight, newOutputProportion);
  }
  
  // fixed width case
  const hasHeigth = newHeight !== null
  if (hasFixedWidth) {
    const newOutputWidth = lastOutputRight - lastOutputLeft;
    const newOutputHeight = hasHeigth
      ? matrixParser(newHeight, following.getRawOutput("HEIGHT"), rootInfo)
      : trunc(safeDivide(newOutputWidth, newProportion));
    return handleMutation(newOutputWidth, newOutputHeight);
  }

  // fixed heigth case
  const hasWidth = newWidth !== null;
  if (hasFixedHeight) {
    const newOutputHeight = lastOutputBottom - lastOutputTop;
    const newOutputWidth = hasWidth
      ? matrixParser(newWidth, following.getRawOutput("WIDTH"), rootInfo)
      : trunc(newOutputHeight * newProportion);
    return handleMutation(newOutputWidth, newOutputHeight);
  }

  // mutation!!! width and heigth case
  const followingWidth = following.getRawOutput("WIDTH");
  const followingHeight = following.getRawOutput("HEIGHT");
  if (hasWidth && hasHeigth) {
    const newOutputWidth = matrixParser(newWidth, followingWidth, rootInfo);
    const newOutputHeight = matrixParser(newHeight, followingHeight, rootInfo);
    const newOutputProportion = safeDivide(newOutputWidth, newOutputHeight);
    return handleMutation(newOutputWidth, newOutputHeight, newOutputProportion);
  }

  // mutation!!! width and proportion case
  if (hasWidth && !hasHeigth) {
    const newOutputWidth = matrixParser(newWidth, followingWidth, rootInfo);
    const newOutputHeight = trunc(safeDivide(newOutputWidth, newProportion));
    return handleMutation(newOutputWidth, newOutputHeight);
  }
  
  // mutation!!! heigth and proportion case
  if (hasHeigth && !hasWidth) {
    const newOutputHeight = matrixParser(newHeight, followingHeight, rootInfo);
    const newOutputWidth = trunc(newOutputHeight * newProportion);
    return handleMutation(newOutputWidth, newOutputHeight);
  }

  // shouldnt reach here
  throw new Error(`Something went wrong in the "setBoxSize" handler...`);
}

//____________
// 3. SIDE EFFECT
const setOffset = ({ node, rootInfo }, patchedState, newPatchedState) => {
  const lastOffsetX = node._getRawState("offset_x");
  const lastOffsetY = node._getRawState("offset_y");
  const newOffsetX = patchedState.offset_x ?? lastOffsetX;
  const newOffsetY = patchedState.offset_y ?? lastOffsetY;
  const lastOutputLeft = node._getRawOutput("LEFT");
  const lastOutputTop = node._getRawOutput("TOP");
  const lastOutputWidth = node._getRawOutput("WIDTH");
  const lastOutputHeight = node._getRawOutput("HEIGHT");
  const lastOutputOffsetX = node._getRawOutput("OFFSET_X");
  const lastOutputOffsetY = node._getRawOutput("OFFSET_Y");
  const newOutputOffsetX = matrixParser(newOffsetX, lastOutputWidth, rootInfo);
  const newOutputOffsetY = matrixParser(newOffsetY, lastOutputHeight, rootInfo);
  const newOutputLeft = newOutputOffsetX + lastOutputLeft;
  const newOutputTop = newOutputOffsetY + lastOutputTop;
  const xWasChanged = newOutputOffsetX !== lastOutputOffsetX;
  const yWasChanged = newOutputOffsetY !== lastOutputOffsetY;
  const outputWasChanged = xWasChanged || yWasChanged;

  // mutation!!!
  node._patchRawState("offset_x", newOffsetX);
  node._patchRawState("offset_y", newOffsetY);
  if (outputWasChanged) {
    node._patchRawOutput("LEFT", newOutputLeft);
    node._patchRawOutput("TOP", newOutputTop);
    node._patchRawOutput("OFFSET_X", newOutputOffsetX);
    node._patchRawOutput("OFFSET_Y", newOutputOffsetY);
  }

  return {
    outputWasChanged,
    callNextHandler: newPatchedState._boxSizeChanged, // needs to update center
    keepEffectAlive: false,
  }
}

//____________
// 4. SIDE EFFECT
const setOrigin = ({ node, rootInfo }, patchedState) => {
  const lastOriginX = node._getRawState("origin_x");
  const lastOriginY = node._getRawState("origin_y");
  const lastCenterMatrix = node._getRawState("center_matrix");
  const newOriginX = patchedState.origin_x ?? lastOriginX;
  const newOriginY = patchedState.origin_y ?? lastOriginY;
  const newCenterMatrix = patchedState.center_matrix ?? lastCenterMatrix;
  const centeredWasChanged = lastCenterMatrix !== newCenterMatrix;
  const halfWidth = trunc(node._getRawOutput("WIDTH") / 2);
  const halfHeight = trunc(node._getRawOutput("HEIGHT") / 2);
  
  // mutation!!! all cases
  node._patchRawState("origin_x", newOriginX);
  node._patchRawState("origin_y", newOriginY);
  node._patchRawState("center_matrix", newCenterMatrix);
  node._patchRawOutput("CENTERED", newCenterMatrix);

  // mutation!!! centered matrix case
  if (newCenterMatrix) {
    node._patchRawOutput("ORIGIN_X", halfWidth);
    node._patchRawOutput("ORIGIN_Y", halfHeight);
    node._patchRawOutput("CENTER_X", 0);
    node._patchRawOutput("CENTER_Y", 0);

    return {
      outputWasChanged: centeredWasChanged,
      callNextHandler: false,
      keepEffectAlive: false,
    }
  }

  const lastOutputOriginX = node._getRawOutput("ORIGIN_X");
  const lastOutputOriginY = node._getRawOutput("ORIGIN_Y");
  const lastOutputWidth = node._getRawOutput("WIDTH");
  const lastOutputHeight = node._getRawOutput("HEIGHT");
  const newOutputOriginX = matrixParser(newOriginX, lastOutputWidth, rootInfo);
  const newOutputOriginY = matrixParser(newOriginY, lastOutputHeight, rootInfo);
  const newOutputCenterX = halfWidth - newOutputOriginX;
  const newOutputCenterY = halfHeight - newOutputOriginY;  
  const xWasChanged = newOutputOriginX !== lastOutputOriginX;
  const yWasChanged = newOutputOriginY !== lastOutputOriginY;
  const outputWasChanged = xWasChanged || yWasChanged || centeredWasChanged;

  // mutation!!! normal matrix case
  if (outputWasChanged) {
    node._patchRawOutput("ORIGIN_X", newOutputOriginX);
    node._patchRawOutput("ORIGIN_Y", newOutputOriginY);
    node._patchRawOutput("CENTER_X", newOutputCenterX);
    node._patchRawOutput("CENTER_Y", newOutputCenterY);
  }

  return {
    outputWasChanged,
    callNextHandler: false,
    keepEffectAlive: false,
  }
}

//____________
// 5. SIDE EFFECT
const setVisibility = ({ node }, patchedState, newPatchedState) => {
  const treeWasPatched = Object.hasOwn(patchedState, "tree_visibility");
  const lastTreeVisibility = node._getRawState("tree_visibility");
  const lastNodeVisibility = node._getRawState("node_visibility");
  const newTreeVisibility = patchedState.tree_visibility ?? lastTreeVisibility;
  const newNodeVisibility = patchedState.node_visibility ?? lastNodeVisibility;
  const treeWasChanged = newTreeVisibility !== lastTreeVisibility;
  const nodeWasChanged = newNodeVisibility !== lastNodeVisibility;
  const outputWasChanged = treeWasChanged || nodeWasChanged;

  // mutation!!!
  node._patchRawState("tree_visibility", newTreeVisibility);
  node._patchRawState("node_visibility", newNodeVisibility);
  node._patchRawOutput("VISIBILITY", newTreeVisibility && newNodeVisibility);
  if (treeWasPatched) {
    newPatchedState.tree_visibility = patchedState.tree_visibility;
  }

  return {
    outputWasChanged,
    callNextHandler: false,
    keepEffectAlive: treeWasPatched,
  }
}

//____________
// 6. SIDE EFFECT
const setZLayer = ({ node }, patchedState, newPatchedState) => {
  const treeWasPatched = Object.hasOwn(patchedState, "tree_layer");
  const lastTreeLayer = node._getRawState("tree_layer");
  const lastNodeLayer = node._getRawState("node_layer");
  const newTreeLayer = patchedState.tree_layer ?? lastTreeLayer;
  const newNodeLayer = patchedState.node_layer ?? lastNodeLayer;
  const treeWasChanged = newTreeLayer !== lastTreeLayer;
  const nodeWasChanged = newNodeLayer !== lastNodeLayer;
  const outputWasChanged = treeWasChanged || nodeWasChanged;

  // mutation!!!
  node._patchRawState("tree_layer", newTreeLayer);
  node._patchRawState("node_layer", newNodeLayer);
  node._patchRawOutput("Z_LAYER", newTreeLayer + newNodeLayer); // sum
  if (treeWasPatched) {
    newPatchedState.tree_layer = patchedState.tree_layer;
  }
  
  return {
    outputWasChanged,
    callNextHandler: false,
    keepEffectAlive: treeWasPatched,
  }
}

//____________
// 7. SIDE EFFECT
const setBuffered = ({ node }, patchedState) => {
  const newStoreBuffer = patchedState.store_buffer;

  // mutation!!!
  node._patchRawState("store_buffer", newStoreBuffer);
  node._patchRawOutput("BUFFERED", newStoreBuffer);

  return {
    outputWasChanged: true,
    callNextHandler: false,
    keepEffectAlive: false,
  }
}

////////////////////////////
//
const allHandlers = new Map([
  [0, setFollowing],
  [1, setPosition],
  [2, setBoxSize],
  [3, setOffset],
  [4, setOrigin],
  [5, setVisibility],
  [6, setZLayer],
  [7, setBuffered],
]);

////////////////////////////
//
const propagateEffect = (dependencies, patchedState, pending) => {
  const { ALL_NODES, node, dirtyNodes } = dependencies;
  const { nodeId } = node;

  // process this node
  let nodeIsDirty = false;
  let hasNewPending = false;
  let newPending = null;
  const newPatchedState = {};
  const pendingEntries = Object.entries(pending);
  if (!pendingEntries.length) return;
  for (let i = 0; i < pendingEntries.length; i++) { // each side effect
    const [orderKey, handler] = pendingEntries[i];
    const order = Number(orderKey);

    // handle state complex mutations (via raw methods). updates new patched
    const response = handler(dependencies, patchedState, newPatchedState);
    const { outputWasChanged, callNextHandler, keepEffectAlive } = response;
    nodeIsDirty = nodeIsDirty || outputWasChanged; // <--painter flag
    if (callNextHandler && !Object.hasOwn(pending, order + 1)) {
      const nextHandler = allHandlers.get(order + 1);
      const nextEntry = [order + 1, nextHandler];
      if (nextHandler) pendingEntries.splice(i + 1, 0, nextEntry);
      // do not try this at home. mutating during iteration is unsafe
      // quick-fix for now, will refactor to an ordered stack later
    }
    if (!keepEffectAlive) continue; // <--side effect ends here
    if (!newPending) newPending = {};
    newPending[order] = handler; // <--side effect propagates subtree
    hasNewPending = true;
  }
  if (nodeIsDirty) dirtyNodes.add(node); // <--batch mutation!!!
  if (!hasNewPending) return; // <--recursion base case

  // subtree propagation. depth-first traversal (dfs), pre-order variant
  for (const followerId of node._getFollowerIds()) { // each follower
    const follower = ALL_NODES.get(followerId, nodeId);
    if (!follower) continue;
    const newDependencies = {...dependencies, node: follower, following: node};
    propagateEffect(newDependencies, newPatchedState, newPending); // recursion!
  }
}

////////////////////////////
//
const handleSideEffects = (dependencies, patchedState, pending, isActive) => {
  const {
    ALL_NODES,
    RX_MANAGER,
    node,
    state,
    getRootInfo
  } = dependencies;

  const followingId = patchedState.following_id ?? state.get("following_id");
  const following = ALL_NODES.get(followingId);
  if (!following) {
    if (flag.err) apiErrors.followingIdParam(node.nodeId, followingId);
    return;
  }
  const dirtyNodes = new Set(); // mutation expected (batch)
  const rootInfo = getRootInfo();
  const newDependencies = {
    ALL_NODES,
    node,
    following,
    dirtyNodes,
    rootInfo,
  }
  propagateEffect(newDependencies, patchedState, pending); // recursive!!!
  if (isActive) RX_MANAGER._scheduleNodes(dirtyNodes); // paint all changes
}

////////////////////////////
//
const allSideEffects = new Map([
  ["following_id",    { order: 0, handler: setFollowing  }], // 0
  ["left",            { order: 1, handler: setPosition   }], // 1
  ["right",           { order: 1, handler: setPosition   }],
  ["top",             { order: 1, handler: setPosition   }],
  ["bottom",          { order: 1, handler: setPosition   }],
  ["width",           { order: 2, handler: setBoxSize    }], // 2
  ["height",          { order: 2, handler: setBoxSize    }],
  ["proportion",      { order: 2, handler: setBoxSize    }],
  ["offset_x",        { order: 3, handler: setOffset     }], // 3
  ["offset_y",        { order: 3, handler: setOffset     }],
  ["origin_x",        { order: 4, handler: setOrigin     }], // 4
  ["origin_y",        { order: 4, handler: setOrigin     }],
  ["center_matrix",   { order: 4, handler: setOrigin     }],
  ["node_visibility", { order: 5, handler: setVisibility }], // 5
  ["tree_visibility", { order: 5, handler: setVisibility }],
  ["node_layer",      { order: 6, handler: setZLayer     }], // 6
  ["tree_layer",      { order: 6, handler: setZLayer     }],
  ["store_buffer",    { order: 7, handler: setBuffered   }], // 7
]);

////////////////////////////
//
// getStateManagers
export default (dependencies) => {
  const { node, state, outputs } = dependencies;
  const { nodeId } = node;
  const _privateKey = Symbol();

  //____________
  const passiveManager = {

    // GET
    get: key => {
      return cloneIfNeeded(state.get(key))
    },

    // GET
    getByKeys: keys => {
      return keys.reduce((acc, key) => {
        acc[key] = cloneIfNeeded(state.get(key));
        return acc;
      }, {})
    },

    // GET
    getComplete: () => {
      const completeState = {};
      for (const [key, value] of state) {
        completeState[key] = cloneIfNeeded(value);
      }
      return completeState;
    },

    // PATCH
    riskyPatch: (key, value, _activeManagerKey) => {
      if (flag.err) apiErrors.stateParams(nodeId, key, value);
      if (state.get(key) === value) return false;
      const clonedValue = cloneIfNeeded(value);
      const sideEffect = allSideEffects.get(key);
      if (!sideEffect) {
        state.set(key, clonedValue); // simple mutation case
        return true;
      }
      
      // delegate complex mutation to handlers
      const patchedState = { [key]: clonedValue };
      const pending = { [sideEffect.order]: sideEffect.handler };
      const isActive = _privateKey === _activeManagerKey;
      handleSideEffects(dependencies, patchedState, pending, isActive);
      return true;
    },

    // PATCH
    riskyPatchByObject: (keyValues, _activeManagerKey) => {
      const patchedState = {};
      const pendingEffects = {};
      let hasPendingEffects = false;
      let stateWasChanged = false;
      for (const [key, value] of Object.entries(keyValues)) {
        if (flag.err) apiErrors.stateParams(nodeId, key, value);
        if (state.get(key) === value) continue;
        stateWasChanged = true;
        const clonedValue = cloneIfNeeded(value);
        const sideEffect = allSideEffects.get(key);
        if (!sideEffect) {
          state.set(key, clonedValue); // simple mutation case
          continue;
        }
        
        // side effects batch accumulation
        dependencies.patchedState[key] = clonedValue;
        pendingEffects[sideEffect.order] = sideEffect.handler;
        hasPendingEffects = true;
      }

      // early return of simple mutation case
      if (!hasPendingEffects) return stateWasChanged;

      // delegate complex mutation to handlers (in batch)
      const isActive = _privateKey === _activeManagerKey;
      handleSideEffects(dependencies, patchedState, pendingEffects, isActive);
      return stateWasChanged;
    }
  }
  
  //____________
  const activeManager = {

    // GET + PATCH
    ...passiveManager,

    // SET
    set: (key, value) => {
      return riskyPatch(key, value, _privateKey);
    },

    // SET
    setByObject: keyValues => {
      return riskyPatchByObject(keyValues, _privateKey);
    }
  }
  
  //____________
  const outputManager = {

    // GET OUTPUT
    get: key => {
      const realKey = expansions.get(key) ?? key;
      return cloneIfNeeded(outputs.get(realKey));
    },

    // GET OUTPUT
    getByKeys: keys => {
      return keys.reduce((acc, key) => {
        const realKey = expansions.get(key) ?? key;
        acc[realKey] = cloneIfNeeded(outputs.get(realKey));
        return acc;
      }, {})
    },

    // GET OUTPUT
    getComplete: () => {
      const completeOutputs = {};
      for (const [key, value] of outputs) {
        completeOutputs[key] = cloneIfNeeded(value);
      }
      return completeOutputs;
    },
  }

  //____________
  // initialize outputs and return managers
  passiveManager.riskyPatchByObject(Object.fromEntries(state));

  return {
    passive: passiveManager,
    active: activeManager,
    output: outputManager,
  }
}
