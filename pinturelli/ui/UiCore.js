import { testMode } from "../debug/_allModesFlags.js";
import validate from "../debug/testMode/validateUiCore.js";

import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/node.js";

////////////////////////////
//
export default class UiCore {
  #rootPublicKey = null;
  #nodePublicKey = null;

  #SELECT_ALL;
  #RX_MANAGER;
  #EVENT_BUS;
  #DISPATCHER;
  #UI_ROOT;
  
  // internal memory
	#state;
  #stateOutputs = new Map([
    ["LEFT", 0],
    ["RIGHT", 0],
    ["TOP", 0],
    ["BOTTOM", 0],
    ["WIDTH", 0],
    ["HEIGHT", 0],
    ["PROPORTION", 0],
    ["OFFSET_X", 0],
    ["OFFSET_Y", 0],
    ["ORIGIN_X", 0],
    ["ORIGIN_Y", 0],
    ["CENTER_X", 0],
    ["CENTER_Y", 0],
    ["Z_LAYER", 0],
    ["VISIBILITY", true],
    ["BUFFERED", false],
    ["CENTERED", false],
  ]);
  #inmutablePaintings = null;
  #listened = [];
  #listenedGroup = [];

  // utilities
  #getMapFromObject = obj => new Map(Object.entries(obj));
  #copySuperficial = list => (
    list.map(value => {
      if (typeof value !== "object" || value === null) return value;
      if (Array.isArray(value)) return [ ...value ];
      return { ...value };
    })
  );
  #normalizeArray = value => {
    if (value === undefined) return [];
    return Array.isArray(value) ? [...value] : [value];
  }
  #wrapAndMerge = (item, list) => ([
    ...((item !== undefined) ? [item] : []),
    ...(Array.isArray(list) ? list : [])
  ]);
  
	//____________
  // will be freezed!!!
	constructor(dependencies, description) {
    if (testMode) validate.nodeConstructor({ dependencies, description });

    const freeze = Object.freeze;
    const getMapFromObject = this.#getMapFromObject;

    // dependencies
    const {
      UI_ROOT,
      ALL_NODES,
      SELECT_ALL,
      RX_MANAGER,
      EVENT_BUS,
      DISPATCHER,
      getStateManagers,
      _rootPublicKey,
    } = dependencies;
    
    // description
    const {
      rootId,
      nodeId,
      _nodeUUID,
      _getFollowerIds,
      UiClass,
      gestures,
      nodeAssets,
      _initialState,
      paintings,
    } = description;

    this.#SELECT_ALL = SELECT_ALL;
    this.#RX_MANAGER = RX_MANAGER;
    this.#EVENT_BUS = EVENT_BUS;
    this.#DISPATCHER = DISPATCHER;
    this.#UI_ROOT = UI_ROOT;
    
    this.#rootPublicKey = _rootPublicKey;
    this.#nodePublicKey = Symbol(nodeId);
    console.log("COREeeeee", description, this);

    // info
    this.rootId = rootId;
    this.nodeId = nodeId;
    this._nodeUUID = _nodeUUID;
    this._getFollowerIds = _getFollowerIds;
    this.UiClass = UiClass;
    this.UiGestures = freeze(gestures);

    // node assets
    this._loadedAssetsMemory = freeze(new Map());
    this._initialAssetLoaders = freeze(getMapFromObject(nodeAssets));
    this._usedAssetLoaders = freeze(getMapFromObject(nodeAssets));
    this._lazyLoadAssets = newAssets => {
      const loaders = getMapFromObject(newAssets);
      const promises = UI_ROOT._loadAssets(this, loaders);
      return Promise.all(promises);
    }
    this._removeAssets = names => {
      const normalizedNames = this.#normalizeArray(names);
      UI_ROOT._removeAssets(this, normalizedNames);
    }
    
    // internal state
    this.#state = getMapFromObject(_initialState);
    this._getRawState = key => this.#state.get(key);
    this._patchRawState = (key, value) => this.#state.set(key, value);
    this._getRawOutput = key => this.#stateOutputs.get(key);
    this._patchRawOutput = (key, value) => this.#stateOutputs.set(key, value);
    
    // public state
    const managers = getStateManagers({ 
      node: this,
      state: this.#state,
      outputs: this.#stateOutputs,
      getRootInfo: UI_ROOT._getInfo,
      ALL_NODES,
      RX_MANAGER,
    });
    this._passiveManager = freeze(managers.passive);
    this._activeManager = freeze(managers.active);
    this._outputManager = freeze(managers.output);
    
    // paintings memory
   this.#inmutablePaintings = freeze({
      _empty: () => {},
      _debug: ({ buffer, state }) => {
        buffer.colorMode("RGB", 1);
        buffer.fill(0.9, 0.5, 0.5, 0.2);
        buffer.stroke(0.3, 0.6, 0.9, 0.5);
        buffer.strokeWeight(2);
        buffer.rect(0, 0, state.get("width"), state.get("height"));
      },
      ...paintings, // overwrites placeholder
    });
    this._getPainting = name => this.#inmutablePaintings[name]; // getter

    // expose node to primary system
    DISPATCHER._setUiConnection(this);
  }

  //____________
  // API Listen
  get listened() {
    return this.#listened.map(args => this.#copySuperficial(args));
  }
  get listenedGroup() {
    return this.#listenedGroup.map(args => this.#copySuperficial(args));
  }
  
  //____________
  // API Listen
  #normalizeReactions(message, newReactions) {
    if (!Array.isArray(newReactions)) return [];
    const { nodeId, _nodeUUID } = this;
    const wrapAndMerge = this.#wrapAndMerge;
    const normalizeArray = this.#normalizeArray;
    const normalizeRelay = (relay = {}) => {
      const { channels } = relay;
      const newChannels = (!channels || channels === "#") ? nodeId : channels;
      return {
        message,
        relayAt: 0,
        ...relay,
        channels: normalizeArray(newChannels),
      }
    }
    
    const normalizedReactions = [];
    for (const reaction of newReactions) {
      
      const {
        config = {},
        middleware,
        middlewares,
        update,
        lastUpdate,
        relay,
        relays,
      } = reaction;

      const {
        token,
        cancelByToken,
        cancelBySelector,
        cancelBySelectorAll,
      } = config;
      
      const _tokenUUID = crypto.randomUUID();
      const newToken = token ? _tokenUUID : token;
      const newConfig = {
        startAt: 0,
        duration: 0,
        riskyRepeat: 0,
        ...config,
        cancelByToken: normalizeArray(cancelByToken),
        cancelBySelector: normalizeArray(cancelBySelector),
        cancelBySelectorAll: normalizeArray(cancelBySelectorAll),
        token: newToken,
        _tokenUUID,
        _nodeUUID,
      }
      const newMiddlewares = wrapAndMerge(middleware, middlewares);
      const newRelays = wrapAndMerge(relay, relays);
      const newUpdate = update ?? (() => false);
      const newLastUpdate = lastUpdate ?? (() => false);

      const newReaction = {
        config: newConfig,
        middlewares: newMiddlewares,
        update: newUpdate,
        lastUpdate: newLastUpdate,
        relays: newRelays.map(normalizeRelay),
      }

      normalizedReactions.push(newReaction);
    }

    return normalizedReactions;
  }

  //____________
  // API Listen
  listen(channelId, message, description, groupKey) {
    console.warn("LISTEN1", channelId, message, description, groupKey)
    const { nodeId } = this;
    const wrapAndMerge = this.#wrapAndMerge;
    const isDelegated = groupKey === this.#nodePublicKey;
    
    if (flag.err && !isDelegated) {
      apiErrors.listen(nodeId, channelId, message, description);
    }
    
    const {
      firstConfig = {},
      firstMiddleware,
      firstMiddlewares,
      reaction,
      reactions,
    } = description;
    
    const newFirstConfig = {
      requireData: [],
      riskyBubbling: false,
      riskyRepublishing: false,
      ...firstConfig
    }
    const newFirstMiddlewares = wrapAndMerge(firstMiddleware, firstMiddlewares);
    const newReactions = wrapAndMerge(reaction, reactions) || [];
    console.log("LISTEN2", newReactions)
    
    const newDescription = {
      firstConfig: newFirstConfig,
      firstMiddlewares: newFirstMiddlewares,
      reactions: this.#normalizeReactions(message, newReactions)
    }
    console.log("LISTEN3", newDescription)
    
    this.#EVENT_BUS._subscribe(channelId, message, nodeId, newDescription);
    console.log("LISTEN4subscribed", channelId, message, nodeId, newDescription);
    
    // internal memory update
    this.#listened.push([channelId, message, newDescription]);
    if (isDelegated) return newDescription;
  }
  
  //____________
  // API Listen
  listenGroup(selector, message, description) {
    const { nodeId } = this;
    if (flag.err) apiErrors.listenGroup(nodeId, selector, message, description);
    
    // get group
    const getIds = () => this.#SELECT_ALL(selector).map(({ nodeId }) => nodeId);
    const groupIds = Array.isArray(selector) ? [ ...selector ] : getIds();
    
    // delegate single cases
    const groupKey = this.#nodePublicKey;
    let newDescription = description; // saves last description
    for (const channelId of groupIds) {
      newDescription = this.listen(channelId, message, description, groupKey);
    }

    // internal memory update
    const newSelector = Array.isArray(selector) ? groupIds : selector;
    this.#listenedGroup.push([newSelector, message, newDescription]);
  }

  //____________
  // API Listen
  stopListening(channelId, message, groupKey) {
    const { nodeId } = this;
    const isDelegated = groupKey === this.#nodePublicKey;

    if (!isDelegated) {
      if (flag.err) apiErrors.stopListening(nodeId, channelId, message);
      this.#listened = this.#listened.filter(args => (
        args[0] !== channelId || args[1] !== message
      ));
    }

    if (!message) this.#EVENT_BUS._unsubscribeChannel(channelId, nodeId);
    else this.#EVENT_BUS._unsubscribeMessage(channelId, message, nodeId);
  }

  //____________
  // API Listen
  stopListeningGroup(selector, message) {
    apiErrors.stopListeningGroup(this.nodeId, selector, message);
    this.#listenedGroup = this.#listenedGroup.filter(args => (
      args[0] !== selector || args[1] !== message
    ));

    // get group
    const getIds = () => this.#SELECT_ALL(selector).map(({ nodeId }) => nodeId);
    const groupIds = Array.isArray(selector) ? [ ...selector ] : getIds();

    // delegate single cases
    const groupKey = this.#nodePublicKey;
    for (const channelId of groupIds) {
      this.stopListening(channelId, message, groupKey);
    }
  }

  //____________
  #getActualAssetLoaders() {
    const fromEntries = Object.fromEntries;
    const initalLoaders = fromEntries(this._initialAssetLoaders);
    const usedLoaders = fromEntries(this._usedAssetLoaders);
    const allLoaders = { ...initalLoaders, ...usedLoaders };
    const allEntries = this.#getMapFromObject(allLoaders);
    return fromEntries(allEntries);
  }

  //____________
  _getCloneDescription() {
    const copySuperficial = this.#copySuperficial;
    return {
      rootId: this.rootId,
      nodeId: this.nodeId,
      UiClass: this.UiClass,
      UiGestures: [ ...this.UiGestures ],
      assets: this.#getActualAssetLoaders(),
      state: this._passiveManager.getComplete(),
      paintings: Object.fromEntries(this.#inmutablePaintings),
      listened: this.#listened.map(args => copySuperficial(args)),
      listenedGroup: this.#listenedGroup.map(args => copySuperficial(args)),
    }
  }

  //____________
  _removeReferences(unknownKey) {
    const rootKey = this.#rootPublicKey;
    const { nodeId, _nodeUUID } = this;
    if (unknownKey !== rootKey) return false;
    let done = true;
    done = this.#RX_MANAGER._removeReferences(_nodeUUID, rootKey) && done;
    this.#EVENT_BUS._removeReferences(nodeId, rootKey); // some
    this.#DISPATCHER._removeReferences(_nodeUUID, rootKey); // some
    done = this.#UI_ROOT._removeNodeReferences(_nodeUUID, rootKey) && done;
    return done;
  }
}
