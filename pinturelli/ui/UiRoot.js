// import apiErrors from "../debug/devErrorsRootTypes.js";
// import dbgr from "../debug/validateUiRoot.js";

////////////////////////////
//
export default class UiRoot {
  #resolution = {};
  #selectAll;
  #debugging;
  #debug;
  #SKETCH;
  
  //____________
  // will be freezed!!!
  constructor(SKETCH, description) {
    // apiErrors.rootConstructor(description);

    // public properties
    this.id = description.id;
    this.rootId = description.rootId;
    this.UiClass = "UiRoot";
    this.UiGestures = Object.freeze([]);
    this._id_followers = description._id_followers;

    // private properties
    this.#selectAll = description.selectAll;
    this.#debugging = description?.debugSelector ?? ""; // path, or array of ids
    this.#debug = this.#debugging !== "";
    this.#SKETCH = SKETCH;

    // API State (for compatibility)
    this._setResolution(description);
    const fakeState = {
      labels: [],
      followingId: "ARGUZZI",
      left: 0,
      top: 0,
      width: 200,
      height: 300,
      offsetX: 0,
      offsetY: 0,
      originX: 0,
      originY: 0,
      treeIsVisibile: true,
      nodeIsVisibile: false,
      treeLayer: 0,
      nodeLayer: 0,
    }
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
      acc.unshift(followed._id_followers.indexOf(node.id));
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
      const rootTragets = this.#selectAll(`${this.id} ${this.#debugging}`);
      return rootTragets.some(targetNode => targetNode.id === nodeId);
    }
    return this.#debugging.some(targetId => targetId === nodeId);
  }

  //____________
  _setResolution(description, password) {
    if (password !== "everybodycallsmegiorgio") return;
    // if (this.#debug) dbgr.setResolution(description);

    this.#resolution = { x: description?.resolutionX ?? 540 };

    if (Object.hasOwn(description, "resolutionY")) {
      this.#resolution.y = description.resolutionY;
      return;
    }

    if (Object.hasOwn(description, "proportion")) {
      this.#resolution.y = this.#resolution.x * description.proportion;
      return;
    }
  }
}
