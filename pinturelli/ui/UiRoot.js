import { devMode } from "../debug/_allModesFlags.js";
import validate from "../debug/devMode/validateUiRoot.js";

////////////////////////////
//
export default class UiRoot {
  #resolutionX;
  #resolutionY;
  #proportion;
  #allNodes;
  #selectAll;
  #debugging;
  #debug;
  #sketch;
  
  //____________
  // will be freezed!!!
  constructor(dependencies, description) {

    // public info
    this.nodeId = description.rootId;
    this.rootId = description.rootId;
    this.UiClass = "UiRoot";
    this.UiGestures = Object.freeze([]);
    this._getFollowerIds = dependencies._getFollowerIds;

    this._assetsLoaders = description.globalAssets;
    this._setAssets = () => {}; // pending

    // private properties
    this.#allNodes = description.allNodes;
    this.#selectAll = description.selectAll;
    this.#debugging = description?.debugSelector ?? ""; // path, or array of ids
    this.#debug = this.#debugging !== "";
    this.#sketch = dependencies.sketch;

    //____________
    // API State (fake, just for compatibility)
    const fakeState = {
      labels: Object.freeze([]),
      followingId: "ARGUZZI",
      left: 0,
      rigth: 0,
      top: 0,
      bottom: 0,
      width: this.#resolutionX,
      height: this.#resolutionY,
      proportion: this.#proportion,
      offsetX: 0,
      offsetY: 0,
      originX: 0,
      originY: 0,
      treeVisibility: true,
      nodeVisibility: false,
      treeLayer: 0,
      nodeLayer: 0,
    }

    //____________
    // API State (fake)
    this._passiveManager = Object.freeze({
      get: key => fakeState?.[key],
      getByKeys: keys => keys.reduce((acc, key) => {
        acc[key] = fakeState?.[key];
        return acc;
      }, {}),
      riskyPatch: () => {},
      riskyPatchByObject: () => {},
      loadLocalAsset: () => {},
      deleteLocalAsset: () => {},
    });

    //____________
    // API State (fake)
    this._activeManager = Object.freeze({
      ...this._passiveManager,
      set: () => {},
      setByObject: () => {},
    });

    //____________
    // API State (fake)
    this._hiddenManager = Object.freeze({
      _setIdxChain: () => {},
      _getIdxChain: () => [0],
      _getPosition: () => ({ x: 0, y: 0 }),
      _getVisibility: () => false,
      _getZLayer: () => 0,
    });

    //____________
    // API State (fake)
    this._getPublicState = key => fakeState?.[key];
  }

  //____________
  get debug() {
    return this.#debug;
  }
  
  //____________
  _manageIndexChain(finalNode) {
    const goToRoot = (node, acc) => {
      const followedId = node._getPublicState("followingId");
      if (followedId === "ARGUZZI") return;
      const followed = this.#selectAll(`#${followedId}`);
      acc.unshift(followed._getFollowerIds().indexOf(node.nodeId));
      goToRoot(followed, acc);
      return acc;
    }
    const newChain = goToRoot(finalNode, []);
    finalNode._setRootIndexChain(newChain);
  }

  //____________
  _manageDebug(nodeId) {
    if (this.#debugging === "") return false;
    if (this.#debugging === "*") return true;
    if (typeof this.#debugging === "string") {
      const rootTragets = this.#selectAll(`${this.nodeId} ${this.#debugging}`);
      return rootTragets.some(targetNode => targetNode.nodeId === nodeId);
    }
    return this.#debugging.some(targetId => targetId === nodeId);
  }

  //____________
  _updateResolution(password, description) {
    if (password !== "everybodycallsmegiorgio") return;
    if (devMode) validate.updateResolution(description);

    const lastX = this.#resolutionX;
    const lastY = this.#resolutionY;

    const { resolutionX, resolutionY, proportion } = description;
    const hasResolutionX = resolutionX !== null;
    const hasResolutionY = resolutionY !== null;

    // proportion overwritten
    if (hasResolutionX && hasResolutionY) {
      const deltaX = Math.abs(resolutionX - lastX);
      const deltaY = Math.abs(resolutionY - lastY);
      if (deltaX < 1 && deltaY < 1) return;
      this.#resolutionX = resolutionX;
      this.#resolutionY = resolutionY;
      this.#proportion = resolutionX / resolutionY;
      this.#propagateNewSize(resolutionX, resolutionY);
      return;
    }

    // proportion mandatory
    if (proportion === null) {
      if (devMode) validate.updateResolutionFailed(description);
      return;
    }
    const deltaP = Math.abs(proportion - this.#proportion);

    // deduce resolutionY
    if (!hasResolutionY && hasResolutionX) {
      const deltaX = Math.abs(resolutionX - lastX);
      if (deltaP < 0.001 && deltaX < 1) return;
      this.#resolutionX = resolutionX;
      this.#resolutionY = resolutionX / proportion;
      this.#proportion = proportion;
      this.#propagateNewSize(resolutionX, this.#resolutionY);
      return;
    }

    // deduce resolutionX
    if (!hasResolutionX && hasResolutionY) {
      const deltaY = Math.abs(resolutionY - lastY);
      if (deltaP < 0.001 && deltaY < 1) return;
      this.#resolutionX = resolutionY * proportion;
      this.#resolutionY = resolutionY;
      this.#proportion = proportion;
      this.#propagateNewSize(this.#resolutionX, resolutionY);
      return;
    }
  }

  #propagateNewSize(resolutionX, resolutionY) {
    for (const nodeId of this._getFollowerIds()) {

      const node = this.#allNodes.get(nodeId);
      const targetStates = node._passiveManager.getByKeys(["right", "bottom"]);
      const activeStates = {};
      // if (targetStates?.right) activeStates.push("right");
      // if (targetStates?.bottom) activeStates.push("bottom");

      // node._activeManager.setByObject({
        
      // });
    }

    this.#sketch.resize(resolutionX, resolutionY);
  }
}
