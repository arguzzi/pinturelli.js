import { testMode } from "../debug/_allModesFlags.js";
import validate from "../debug/testMode/validateUiCore.js";

import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/node.js";

////////////////////////////
//
export default class UiCore {
  #UI_ROOT;
  #ALL_NODES;
  #SELECT_ALL;
  #CAT_PAINTER;
  #DISPATCHER;
  #EVENT_BUS;
  
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

  // internal memory
  #registryKey = null;
  #nodeKey = Symbol();
  #listened = [];
  #listenedGroup = [];

  // utilities
  #cloneIfNeeded = null;
  #cloneSuperficial = list => (
    list.map(value => {
      if (typeof value !== "object" || value === null) return value;
      if (Array.isArray(value)) return [ ...value ];
      return { ...value };
    })
  );
  #normalizeArray = value => {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
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

    // dependencies
    const {
      UI_ROOT,
      ALL_NODES,
      SELECT_ALL,
      DISPATCHER,
      EVENT_BUS,
      CAT_PAINTER,
      getStateManagers,
      registryKey,
    } = dependencies;

    this.#UI_ROOT = UI_ROOT;
    this.#ALL_NODES = ALL_NODES;
    this.#SELECT_ALL = SELECT_ALL;
    this.#CAT_PAINTER = CAT_PAINTER;
    this.#DISPATCHER = DISPATCHER;
    this.#EVENT_BUS = EVENT_BUS;
    this.#registryKey = registryKey;

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

    // info
    this.rootId = rootId;
    this.nodeId = nodeId;
    this._nodeUUID = _nodeUUID;
    this._getFollowerIds = _getFollowerIds;
    this.UiClass = UiClass;
    this.UiGestures = freeze(gestures);

    // node assets
    this._initialAssetLoaders = new Map(Object.entries(nodeAssets));
    this._loadedAssetsMemory = new Map();
    
    // private state
    this.#state = new Map(Object.entries(_initialState));
    this._getRawState = key => this.#state.get(key);
    this._patchRawState = (key, value) => this.#state.set(key, value);
    this._getRawOutput = key => this.#stateOutputs.get(key);
    this._patchRawOutput = (key, value) => this.#stateOutputs.set(key, value);
    
    // public state
    const managers = getStateManagers({ 
      node: this,
      state: this.#state,
      outputs: this.#stateOutputs,
      ALL_NODES,
      CAT_PAINTER,
    });
    this._passiveManager = freeze(managers.passive);
    this._activeManager = freeze(managers.active);
    this._outputManager = freeze(managers.output);
    this.#cloneIfNeeded = managers._cloneIfNeeded;
	
    // paintings
    this._localBuffer = null;
    this._paintings = freeze(new Map([
      ["_empty", () => {}],
      ["_debug", ({ buffer, state }) => {
        buffer.colorMode("RGB", 1);
        buffer.fill(0.9, 0.5, 0.5, 0.2);
        buffer.stroke(0.3, 0.6, 0.9, 0.5);
        buffer.strokeWeight(2);
        buffer.rect(0, 0, state.get("width"), state.get("height"));
      }],
      ...Object.entries(paintings),
    ]));
  }

  //____________
  // API Listen
  get listened() {
    return this.#listened.map(args => this.#cloneSuperficial(args));
  }
  get listenedGroup() {
    return this.#listenedGroup.map(args => this.#cloneSuperficial(args));
  }
  
  //____________
  // API Listen
  #normalizeReactions(channelId, message, newReactions) {
    if (!Array.isArray(newReactions)) return [];
    const { nodeId } = this;
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

      const newConfig = {
        token: `${channelId} ${message} ${nodeId}`,
        startAt: 0,
        riskyRepeat: 0,
        ...config,
        cancelByToken: normalizeArray(config.cancelByToken),
        cancelBySelector: normalizeArray(config.cancelBySelector),
        cancelBySelectorAll: normalizeArray(config.cancelBySelectorAll)
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
    const { nodeId } = this;
    const wrapAndMerge = this.#wrapAndMerge;
    const isDelegated = groupKey === this.#nodeKey;

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
      propagation: false,
      bubbling: false,
      ...firstConfig
    }
    const newFirstMiddlewares = wrapAndMerge(firstMiddleware, firstMiddlewares);
    const newReactions = wrapAndMerge(reaction, reactions);

    const newDescription = {
      firstConfig: newFirstConfig,
      firstMiddlewares: newFirstMiddlewares,
      reactions: this.#normalizeReactions(channelId, message, newReactions)
    }

    this.#EVENT_BUS._subscribe(channelId, message, nodeId, newDescription);
    
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
    const groupKey = this.#nodeKey;
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
    const isDelegated = groupKey === this.#nodeKey;

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
    const groupKey = this.#nodeKey;
    for (const channelId of groupIds) {
      this.stopListening(channelId, message, groupKey);
    }
  }

  //____________
  _getCloneDescription() {
    const cloneSuperficial = this.#cloneSuperficial;
    return {
      rootId: this.rootId,
      nodeId: this.nodeId,
      UiClass: this.UiClass,
      UiGestures: [ ...this.UiGestures ],
      state: this._passiveManager.getComplete(),
      paintings: Object.fromEntries(this._paintings),
      listened: this.#listened.map(args => cloneSuperficial(args)),
      listenedGroup: this.#listenedGroup.map(args => cloneSuperficial(args)),
    }
  }
    
  //____________
  _removeReferences(unknownKey) {
    if (unknownKey !== this.#registryKey) return;
    // pending 
  }
}
