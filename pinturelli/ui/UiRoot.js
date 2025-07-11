import { testMode } from "../debug/_allModesFlags.js";
import validate from "../debug/testMode/validateUiRoot.js";

import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/root.js";

////////////////////////////
//
export default class UiRoot {
  #SKETCH;
  #EVENT_BUS;
  #rootPublicKey = null;

  // internal memory
  #fakeState = new Map([
    ["following_id", "ARGUZZI"],                                         /* 00 */
    ["labels", Object.freeze([])],                                      /* 01 */
    ["left", 0],                                                        /* 02 */
    ["right", 0],                                                       /* 03 */
    ["top", 0],                                                         /* 04 */
    ["bottom", 0],                                                      /* 05 */
    ["width", 0], // real use                                           /* 06 */
    ["height", 0], // real use                                          /* 07 */
    ["proportion", 0], // real use                                      /* 08 */
    ["offset_x", 0],                                                     /* 09 */
    ["offset_y", 0],                                                     /* 10 */
    ["node_layer", 0],                                                   /* 11 */
    ["tree_layer", 0],                                                   /* 12 */
    ["inside_layer", 0],                                                 /* 13 */
    ["node_visibility", false],                                          /* 14 */
    ["tree_visibility", true],                                           /* 15 */
    ["layerVisibility", true],                                          /* 16 */
    ["painting", "_empty"],                                             /* 17 */
    ["overlayed_painting", "_empty"],                                    /* 18 */
    ["store_buffer", false],                                             /* 19 */
    ["center_matrix", false],
  ]);
  #fakeOutputs = new Map([
    ["LEFT", 0],
    ["RIGHT", 0],
    ["TOP", 0],
    ["BOTTOM", 0],
    ["WIDTH", 0], // real use
    ["HEIGHT", 0], // real use
    ["PROPORTION", 0], // real use
    ["OFFSET_X", 0],
    ["OFFSET_Y", 0],
    ["ORIGIN_X", 0],
    ["ORIGIN_Y", 0],
    ["CENTER_X", 0],
    ["CENTER_Y", 0],
    ["Z_LAYER", 0],
    ["VISIBILITY", false],
    ["BUFFERED", false],
    ["CENTERED", false],
  ]);
  
  //____________
  // will be freezed!!!
  constructor(dependencies, description) {
    const freeze = Object.freeze;

    // dependencies
    const {
      SKETCH,
      EVENT_BUS,
      _rootPublicKey,
    } = dependencies;

    this.#SKETCH = SKETCH;
    this.#EVENT_BUS = EVENT_BUS;
    this.#rootPublicKey = _rootPublicKey;

    // description
    const {
      rootId,
      _nodeUUID,
      _getFollowerIds,
      rootAssets,
      WIDTH,
      HEIGHT,
      PROPORTION,
    } = description;

    // info
    this.rootId = rootId;
    this.nodeId = rootId;
    this._nodeUUID = _nodeUUID;
    this.UiClass = "/Void";
    this.UiGestures = freeze([]);
    this._getFollowerIds = _getFollowerIds;

    // tree assets
    this._loadedAssetsMemory = new Map();
    this._initialAssetLoaders = new Map(Object.entries(rootAssets));

    // initial size
    this._setRootSize({ WIDTH, HEIGHT, PROPORTION });

    // fake state (just for compatibility)
    const fakeState = this.#fakeState;
    const fakeOutputs = this.#fakeOutputs;
    this._getRawState = key => fakeState.get(key);
    this._patchRawState = () => null;
    this._getRawOutput = key => fakeOutputs.get(key);
    this._patchRawOutput = () => null;
    this._passiveManager = freeze({
      get: key => fakeState.get(key),
      getByKeys: keys => keys.reduce((acc, key) => {
        if (fakeState.has(key)) acc[key] = fakeState.get(key);
        return acc;
      }, {}),
      riskyPatch: () => null,
      riskyPatchByObject: () => null,
    });
    this._activeManager = freeze({
      ...this._passiveManager,
      set: () => null,
      setByObject: () => null,
    });
    this._outputManager = freeze({
      get: key => fakeOutputs.get(key),
      getByKeys: keys => keys.reduce((acc, key) => {
        if (fakeOutputs.has(key)) acc[key] = fakeOutputs.get(key);
        return acc;
      }, {}),
    });

    // fake api (just for compatibility)
    this.listened = freeze([]);
    this.listenedGroup = freeze([]);
    this.listen = () => null;
    this.listenGroup = () => null;
    this.stopListening = () => null;
    this.stopListeningGroup = () => null;
    this._getPainting = name => {
      const placeholder = { _empty: () => {},  _debug: () => {} };
      return placeholder[name];
    }
  }

  //____________
  _getInfo() {
    // canvas resolution
    // px and rem equivalent
    // viewport w/h equivalent
    // d-viewport w/h equivalent
  }
  
  //____________
  _loadAssets(node, assetLoaders, logAssets = {}) {
    const isLazyLoading = this.#SKETCH._pinturelli.wasFirstPainted;
    const EVENT_BUS = this.#EVENT_BUS;
    const { nodeId } = node;
    const nodeNamespace = logAssets[nodeId]; // external mutation for logging
    const nodePromises = new Set();

    for (const [assetName, loader] of Object.entries(assetLoaders)) {
      const [functionName, source, successCallback, errorCallback] = loader;
      if (flag.err) apiErrors.loaderFormat(nodeId, assetName, loader);

      // prevention
      const q5Function = q5[functionName];
      if (typeof functionName !== "function") {
        if (flag.err) apiErrors.unknownFunction(functionName);
        const loadingAssetError = {
          _0_node: nodeId,
          _1_asset: assetName,
          _3_source: source,
          _4_loader: functionName,
          _log: `Unknown loader: "${functionName}" (expected a q5 function).`,
          _original_error: {},                                
        }
        errorCallback?.(loadingAssetError);
        continue;
      }

      // start loading
      const promise = q5Function(source)
        .then(loadedAsset => {
          nodeNamespace[assetName] = source; // external mutation for logging
          node._loadedAssetsMemory.set(assetName, loadedAsset); // node mutation
          successCallback?.(loadedAsset, assetName);
          if (!isLazyLoading) return;
          EVENT_BUS._emit(nodeId, "loaded_asset", { assetName, source });
        })
        .catch(error => {
          const loadingAssetError = {
            _0_node: nodeId,
            _1_asset: assetName,
            _3_source: source,
            _4_loader: functionName,
            _log: `Failed loading asset: "${assetName}" in node: "${nodeId}".`,
            _original_error: error,
            ...error
          }
          errorCallback?.(loadingAssetError);
        });

      nodePromises.add(promise);
    }
    return nodePromises;
  }
  
  //____________
  _removeAssets(node, assetNames) {
    const { nodeId } = node;
    if (flag.err) apiErrors.assetNamesFormat(nodeId, assetNames);

    for (const assetName of assetNames) {
      if (flag.err) apiErrors.unknownAssetName(node, assetName);
      const source = node._
      EVENT_BUS._emit(nodeId, "deleting_asset", { assetName, source });
    }
  }

  //____________
  _setRootSize(sizeState) {
    if (flag.err) apiErrors.sizeFormat(this.rootId, sizeState);
    const { WIDTH, HEIGHT, PROPORTION } = sizeState;
    const fakeState = this.#fakeState;
    const fakeOutputs = this.#fakeOutputs;
    fakeState.set("WIDTH", WIDTH);
    fakeState.set("HEIGHT", HEIGHT);
    fakeState.set("PROPORTION", PROPORTION);
    fakeOutputs.set("WIDTH", WIDTH);
    fakeOutputs.set("HEIGHT", HEIGHT);
    fakeOutputs.set("PROPORTION", PROPORTION);
    // pending:
    // dom integration,
    // handle side effects
    // tree propagation
  }

  //____________
  _getCloneDescription() {
  }

  //____________
  _removeNodeReferences(targetId, unknownKey) {
    if (unknownKey !== this.#rootPublicKey) return;
  }

  //____________
  _removeReferences(unknownKey) {
    if (unknownKey !== this.#rootPublicKey) return;
  }
}
