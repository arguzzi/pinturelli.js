import { devMode } from "../debug/_allModesFlags.js";
import validate from "../debug/devMode/validateUiCore.js";

import flag from "../debug/_allModesFlags.js";
import apiErrors from "../debug/apiErrors/node.js";

////////////////////////////
//
export default class UiCore {
  #debug;
	#state;
	#assets;
	#rootIndexChain;
  #DISPATCHER;
  #EVENT_BUS;
  
	//____________
  // will be freezed!!!
	constructor(dependencies, description) {
    // apiErrors.nodeConstructor(dependencies, description);

    const {
      UI_ROOT,
      ALL_NODES,
      DISPATCHER,
      EVENT_BUS,
      PAINTER,
      stateManagers
    } = dependencies;

    // public info
    this.nodeId = description.nodeId;
    this.rootId = description.rootId;
    this.UiClass = description.UiClass;
    this.UiGestures = Object.freeze(description.gestures);

    // 
    this._getFollowerIds = description._getFollowerIds;
    this._assetsLoaders = description.localAssets;
    this._setAssets = () => {}; // pending
    this._paintings = {
      ...description.paintings,
      _empty: () => {},
      _debug: (q5, state) => {
        q5.strokeWeight(2);
        q5.stroke(0.3, 0.6, 0.9, 0.7);
        q5.fill(0.9, 0.5, 0.5, 0.2);
        q5.rect(0, 0, state.get("width"), state.get("height"));
      },
    }


    this.#state = description._privateState;
    this.#assets = description?.assets ?? {};
    this.#rootIndexChain = null;
    this.#DISPATCHER = DISPATCHER;
    this.#EVENT_BUS = EVENT_BUS;

    const updateDebug = () => this.#debug = UI_ROOT._manageDebug(this.nodeId);
    updateDebug();

    // API State
    const thisNode = this;
    const allArgs = {
      node: thisNode,
      state: thisNode.#state,
      painter: PAINTER,
      updaters: {
        debug: updateDebug,
        indexChain: () => UI_ROOT._manageIndexChain(thisNode),
        subtree: patchedState => {
          for (const followerId of thisNode._getFollowerIds()) {
            const follower = ALL_NODES.get(followerId);
            follower._passiveManager.riskyPatchByObject(patchedState);
          }
        }
      },
    };

    this._hiddenManager = Object.freeze(new stateManagers["Hidden"](allArgs));
    this._passiveManager = Object.freeze(new stateManagers["Passive"](allArgs));
    this._activeManager = Object.freeze(new stateManagers["Active"](allArgs));
    this._getPublicState = key => this._passiveManager.get(key); // dev-only
	}

  //____________
  get debug() {
    return this.#debug;
  }

  get _rootIndexChain() {
    return [ ...this.#rootIndexChain ];
  }

  _setRootIndexChain(newChain) {
    this.#rootIndexChain = newChain;
  }

  // //____________
  // // reminder:
  // // this._subscriptions = {pubId: [eventName, eventName...], pubId: [], ...}
  // #publish(eventName, data) {
  //   if (this.#debug) dbgr.publishParams(eventName, data);
  //   this.GLOBAL.EVENT_BUS.publish(this.nodeId, eventName, data);
  // }

  // #subscribe(pubId, eventName, callbacks) {
  //   if (this.DEBUG) dbgr.subscribeParams(this, pubId, eventName, callbacks);
  //   this.GLOBAL.EVENT_BUS.subscribe(pubId, eventName, this.nodeId, callbacks);

  //   const subscriptions = this.SUBSCRIPTIONS;
  //   if (!Array.isArray(subscriptions[pubId])) subscriptions[pubId] = [];
  //   if (subscriptions[pubId].includes(eventName)) return;
  //   subscriptions[pubId].push(eventName);
  // }

  // #unsubscribe(pubId, eventName) {
  //   if (this.DEBUG) dbgr.unsubscribeParams(this, pubId, eventName);
  //   this.GLOBAL.EVENT_BUS.unsubscribe(pubId, eventName, this.nodeId);
  //   this.SUBSCRIPTIONS.splice(this.SUBSCRIPTIONS.indexOf(eventName), 1);
  // }

  #getReaction(channelId, message, reactionInput) {
    const reaction = {};
    const repeatConfig = reactionInput?.riskyRepeat ?? 0;
    const _info = [channelId, message, this.nodeId, repeatConfig, 0];

    reaction.config = {
      _info,
      token: _info.toString(),
      startAt: 0,
      duration: 0,
      riskyRepeat: 0,
      useTimeBezier: null,
      useTimeSteps: null,
      cancelByToken: null,
      cancelBySelector: null,
      cancelBySelectorAll: null,
      ...(reactionInput?.config ?? {}),
    };

    const useTimeInput = reactionInput?.config?.useTime;
    if (useTimeInput) {
      const joinSet = new Set([ "ms", "frame", "nodeFrame", ...useTimeInput]);
      reaction.config.useTime = [ ...joinSet ];
    }

    reaction.update = reactionInput?.update ?? (() => false);
    reaction.lastUpdate = reactionInput?.lastUpdate ?? (() => false);
    description.validate = [ ...(reactionInput?.validate ?? []) ];

    return reaction;
  }

  //____________
  listen(channelId, message, descriptionInput) {
    const description = {};
    
    description.firstUpdate = descriptionInput?.firstUpdate ?? (() => {});
    description.firstValidate = [ ...(descriptionInput?.firstValidate ?? []) ];
    description.firstConfig = {
      requireData: [],
      propagation: false,
      ...(descriptionInput?.firstConfig ?? {}),
    }

    description.reactions = [];
    if (Object.hasOwn(descriptionInput, "reaction")) {
      const reactionInput = descriptionInput.reaction;
      const reaction = this.#getReaction(channelId, message, reactionInput);
      description.reactions.push(reaction);
    }

    if (Object.hasOwn(descriptionInput, "reactions")) {
      for (const reactionInput of descriptionInput.reactions) {
        const reaction = this.#getReaction(channelId, message, reactionInput);
        description.reactions.push(reaction);
      }
    }

    this.#EVENT_BUS._listen(channelId, message, this.nodeId, description);
  }

  //____________
  clone(description) {
  }

  //____________
  _removeReferences(password) {
    if (password !== "everybodycallsmegiorgio") return;

  }
}