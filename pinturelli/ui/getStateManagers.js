import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/managers.js";

//____________
const cloneIfNeeded = value => {
  if (typeof value !== "object" || value === null) return value;

  try {
    return structuredClone(value)
  } catch (error) { 
    // see "the structured clone algorithm" in "mdn web docs"
    if (flag.err) apiErrors.cloning(value, error);
  }
}

//____________
// chain index is not used anymore
// all others side efects are pending
const setIndexChain = ({ ALL_NODES, node, patchedState }) => {

  // recursion into followers
  const chainPropagator = (target, targetIndexChain) => {
    const followerIds = target._getFollowerIds();
    for (let index = 0; index < followerIds.length; index++) {
      const follower = ALL_NODES.get(followerIds[index]);
      if (!follower) continue;
  
      // follower mutation
      const followerIndexChain = [...targetIndexChain, index];
      follower._patchRawState("indexChain", followerIndexChain);
      chainPropagator(follower, followerIndexChain);
    }
  }

  // root mutation
  const { nodeId } = node;
  const { followingId } = patchedState;
  ALL_NODES.get("_")._updateRelation(nodeId, followingId);

  // node mutation
  const following = ALL_NODES.get(followingId);
  const prevIndexChain = following._getRawState("indexChain");
  const ownIndex = following._getFollowerIds().findIndex(id => id === nodeId);
  const ownIndexChain = [...prevIndexChain, ownIndex];
  node._patchRawState("indexChain", ownIndexChain);
  chainPropagator(node, ownIndexChain);

  // side effects
  // pending!!!!
  // pending!!!!
}

//____________
const setLabelSelection = () => {
}

//____________
const setBoxSize = () => {
}

//____________
const setPosition = () => {
}

//____________
const setPaintingLayer = () => {
}

//____________
const setVisibility = () => {
}

//____________
const setPermanency = () => {
}

//____________
const extensions = new Map([
  ["L", "LEFT"],
  ["LE", "LEFT"],
  ["LEFT", "LEFT"],
  ["R", "RIGHT"],
  ["RI", "RIGHT"],
  ["RIGHT", "RIGHT"],
  ["T", "TOP"],
  ["TO", "TOP"],
  ["TOP", "TOP"],
  ["B", "BOTTOM"],
  ["BO", "BOTTOM"],
  ["BOTTOM", "BOTTOM"],
  ["W", "WIDTH"],
  ["WI", "WIDTH"],
  ["WIDTH", "WIDTH"],
  ["H", "HEIGHT"],
  ["HE", "HEIGHT"],
  ["HEIGHT", "HEIGHT"],
  ["PRP", "PROPORTION"],
  ["PROPORTION", "PROPORTION"],
  ["OFX", "OFFSET_X"],
  ["OFFSET_X", "OFFSET_X"],
  ["OFY", "OFFSET_Y"],
  ["OFFSET_Y", "OFFSET_Y"],
  ["ORX", "ORIGIN_X"],
  ["ORIGIN_X", "ORIGIN_X"],
  ["ORY", "ORIGIN_Y"],
  ["ORIGIN_Y", "ORIGIN_Y"],
  ["CX", "CENTER_X"],
  ["CENTER_X", "CENTER_X"],
  ["CY", "CENTER_Y"],
  ["CENTER_Y", "CENTER_Y"],
  ["Z", "Z_LAYER"],
  ["ZL", "Z_LAYER"],
  ["Z_LAYER", "Z_LAYER"],
  ["V", "VISIBILITY"],
  ["VI", "VISIBILITY"],
  ["VISIBILITY", "VISIBILITY"],
  ["BUF", "BUFFERED"],
  ["BUFFERED", "BUFFERED"],
  ["C", "CENTERED"],
  ["CEN", "CENTERED"],
  ["CENTERED", "CENTERED"],
]);

//____________
const sideEffects = new Map([
  ["followingId", setIndexChain],
  ["labels", setLabelSelection],

  ["left", setPosition],
  ["right", setPosition],
  ["top", setPosition],
  ["bottom", setPosition],
  ["width", setBoxSize],
  ["height", setBoxSize],
  ["proportion", setBoxSize],
  ["offsetX", setPosition],
  ["offsetY", setPosition],

  ["nodeLayer", setPaintingLayer],
  ["treeLayer", setPaintingLayer],
  ["nodeVisibility", setVisibility],
  ["treeVisibility", setVisibility],
  ["layerVisibility", setVisibility],
  ["nodePermanency", setPermanency],
  ["treePermanency", setPermanency],
  ["layerPermanency", setPermanency],
]);


//____________
export default getStateManagers = (args) => {
  const {
    node,
    state,
    outputs,
    ALL_NODES,
    CAT_PAINTER,
  } = args;

  const {
    nodeId,
  } = node;

  // middlewares state param
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
      const entriesArray = [ ...state ];
      const entriesClonated = entriesArray.map(([key, value]) => (
        [key, cloneIfNeeded(value)]
      ));
      return Object.fromEntries(entriesClonated)
    },

    // PATCH
    riskyPatch: (key, value) => {
      if (flag.err) apiErrors.stateParams(nodeId, key, value);
      if (state.get(key) === value) return false;
      const clonedValue = cloneIfNeeded(value);
      state.set(key, clonedValue);
      const patchedState = { [key]: clonedValue };
      sideEffects.get(key)?.({ ...args, patchedState });
      return true;
    },

    // PATCH
    riskyPatchByObject: keyValues => {
      const pendingPatchedStates = new Map();
      
      // state mutation
      let response = false;
      for (const [key, value] of Object.entries(keyValues)) {
        if (flag.err) apiErrors.stateParams(nodeId, key, value);
        if (state.get(key) === value) continue;
        response = true;

        const clonedValue = cloneIfNeeded(value);
        state.set(key, clonedValue);
        
        const sideEffect = sideEffects.get(key);
        if (!sideEffect) continue;

        const lastPatchedState = pendingPatchedStates.get(sideEffect) ?? {};
        const newPatchedState = { ...lastPatchedState, [key]: clonedValue };
        pendingPatchedStates.set(sideEffect, newPatchedState);
      }

      // state outputs mutation
      for (const [sideEffect, changed] of orderedSideEffects) {
        if (!changed) continue;

        const patchedState = pendingPatchedStates.get(sideEffect);
        sideEffect({ ...args, patchedState });
      }

      return response;
    }
  }
  
  // updaters state param
  const activeManager = {

    // GET + PATCH
    ...passiveManager,

    // SET
    set: (key, value) => {
      if (!riskyPatch(key, value)) return false;
      CAT_PAINTER.schedulePainter(node);
      return true;
    },

    // SET
    setByObject: keyValues => {
      if (!riskyPatchByObject(keyValues)) return false;
      CAT_PAINTER.schedulePainter(node);
      return true;
    }
  }
  
  // paintings state param
  const outputManager = {

    // GET OUTPUT
    get: key => {
      const realKey = extensions.get(key);
      return cloneIfNeeded(outputs.get(realKey))
    },

    // GET OUTPUT
    getByKeys: keys => {
      return keys.reduce((acc, key) => {
        const realKey = extensions.get(key);
        acc[realKey] = cloneIfNeeded(outputs.get(realKey));
        return acc;
      }, {})
    },
  }

  // initialize outputs
  passiveManager.riskyPatchByObject(state);

  // export
  return {
    passive: passiveManager,
    active: activeManager,
    output: outputManager,
    _cloneIfNeeded: cloneIfNeeded,
  }
}
