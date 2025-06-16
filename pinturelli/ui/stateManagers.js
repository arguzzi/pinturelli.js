// import apiErrors from "./debug/apiErrorsNodeTypes.js";

////////////////////////////
//
class PassiveManager {
  #sketch;
  #node;
  #state;
  #updaters;
  #keysSideEffects;

  //____________
  // will be freezed!!!
  constructor({ sketch, node, state, painter, updaters }) {
    this.#sketch = sketch;
    this.#node = node;
    this.#state = state;
    this._painter = painter;

    this.#updaters = {
      updateChain: patchedState => {
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
      labels: "updateChain",
      followingId: "updateChain",

      width: "updateSubtree",
      height: "updateSubtree",
      proportion: "updateSubtree",
      
      top: "updateSubtree",
      bottom: "updateSubtree",
      left: "updateSubtree",
      right: "updateSubtree",
      offsetX: "updateSubtree",
      offsetY: "updateSubtree",

      treeVisibility: "updateSubtree",
      nodeVisibility: "updateSubtree",

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

  //____________
  // API Assets
  loadLocalAsset(name, loader) {
  }

  //____________
  // API Assets
  deleteLocalAsset(name) {
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
class HiddenManager extends PassiveManager {
  #idxChain;
  #bufferBox;
  
  // will be freezed!!!
  constructor(args) {
    super(args);
    this.#idxChain = [0];
    this.bufferBox = {
      width: 0,
      height: 0,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      offsetX: 0,
      offsetY: 0,
    }
  }

  //____________
  _setIdxChain() {
  }

  //____________
  _getIdxChain() {
    return [ ...this.#idxChain ];
  }

  //____________
  _setBufferBox() {
  }

  //____________
  _getBufferBox() {
    return { ...this.#bufferBox };
  }

  //____________
  _getVisibility() {
    return this.get("treeVisibility") && this.get("nodeVisibility");
  }

  //____________
  _getZLayer() {
    return this.get("treeLayer") + this.get("nodeLayer");
  }
}

////////////////////////////
//
export default {
  Passive: PassiveManager,
  Active: ActiveManager,
  Hidden: HiddenManager,
}
