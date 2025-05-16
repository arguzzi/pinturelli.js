// import apiErrors from "./debug/apiErrorsNodeTypes.js";

////////////////////////////
//
class PassiveManager {
  #node;
  #state;
  #updaters;
  #keysSideEffects;

  //____________
  // will be freezed!!!
  constructor({ node, state, painter, updaters }) {
    this.#node = node;
    this.#state = state;
    this._painter = painter;

    this.#updaters = {
      updateDebug: patchedState => {
        updaters.debug(node.nodeId); // to UiRoot
        if (!Object.hasOwn(patchedState, "followingId")) return;
        updaters.indexChain(); // to UiRoot
      },
      updateSubtree: patchedState => {
        updaters.subtree(patchedState); // to UiCore
      },
      updateLayers: patchedState => {
        painter.updateLayers(node, patchedState); // to Painter
        const { treeLayer } = patchedState;
        if (treeLayer === undefined) return;
        updaters.subtree({ treeLayer }); // to UiCore
      },
    }

    this.#keysSideEffects = {
      labels: "updateDebug",
      followingId: "updateDebug",
      left: "updateSubtree",
      right: "updateSubtree",
      top: "updateSubtree",
      bottom: "updateSubtree",
      width: "updateSubtree",
      height: "updateSubtree",
      proportion: "updateSubtree",
      offsetX: "updateSubtree",
      offsetY: "updateSubtree",
      treeVisibile: "updateSubtree",
      treeLayer: "updateLayers",
      nodeLayer: "updateLayers",
    }
  }

  //____________
  #cloneIfNeeded(value) {
    if (typeof value !== "object" || value === null) return value;
    // see "structured clone algorithm" in mdn
    try {
      return structuredClone(value)
    }
    catch (error) { 
      // apiErrors.cloneInput(value, error)
    };
  }

  //____________
  // API State
  get(key) {
    // apiErrors.getState(this.#state, key);
    return this.#cloneIfNeeded(this.#state[key]);
  }

  //____________
  // API State
  getByKeys(keys) {
    // apiErrors.getStatesByKeys(this.#state, keys);
    return keys.reduce((acc, key) => {
      acc[key] = this.#cloneIfNeeded(this.#state[key]);
      return acc;
    }, {});
  }

  //____________
  // API State
  riskyPatch(key, value) {
    // apiErrors.riskyPatch(this.#state, key, value);
    const newState = { key, value };
    this._painter.notifyPatch(this.#node, newState);
    this.#state[key] = this.#cloneIfNeeded(value);

    const sideEffect = this.#keysSideEffects?.[key];
    if (!sideEffect) return;
    this.#updaters?.[sideEffect](newState);
  }

  //____________
  // API State
  riskyPatchByObject(newState) {
    // apiErrors.riskyPatchByObject(this.#state, newState);
    const sideEffects = new Map();
    this._painter.notifyPatch(this.#node, newState);
    for (const [key, value] of Object.entries(newState)) {
      this.#state[key] = this.#cloneIfNeeded(value);
      
      const sideEffect = this.#keysSideEffects?.[key];
      if (!sideEffect) continue;
      const patchedState = sideEffects.get(sideEffect);
      if (!patchedState) patchedState = { key, value };
      else patchedState[key] = value; // accumulation
    }

    for (const [sideEffect, patchedState] of sideEffects) {
      this.#updaters?.[sideEffect](patchedState);
    }
  }
}

////////////////////////////
//
class ActiveManager extends PassiveManager {

  // will be freezed!!!
  constructor(args) {
    super(args);
  }

  //____________
  // API State
  set(key, value) {
    this.riskyPatch(key, value);
    this._painter.schedulePainter();
  }

  //____________
  // API State
  setByObject(newState) {
    this.riskyPatchByObject(newState);
    this._painter.schedulePainter();
  }
}

////////////////////////////
//
export default {
  Passive: PassiveManager,
  Active: ActiveManager,
}
