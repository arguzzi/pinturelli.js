
//////////////////////////////
//
export default class ReactionManager {
  #SELECT_ALL;
  #CAT_PAINTER; // by subscription
  #rootPublicKey = null;

  // local memory
  #delaysByTokenUUID = new Map(); // [tokenUUID: timer, tokenUUID: tim...]
  #animationsByNodeUUID = new Map(); // [nodeUUID: timer, nodeUUID: tim...]
  #toRepeatByTokenUUID = new Map(); // [tokenUUID: timer, tokenUUID: tim...]
  #nextFrameByTokenUUID = new Map(); // [tokenUUID: [subscriber, reaction], ...]
  #reactionsByTokenUUID = new Map(); // [tokenUUID: reaction, tokenUUID: rea...]
  #allTokensByNodeUUID = new Map(); // [nodeUUID: Map{token: tokenUUID}, nod...]
  #dirtyNodes = new Set(); // [node, node, ...]

  //____________
  // will be freezed!!!
  constructor({ SELECT_ALL, CAT_PAINTER, _rootPublicKey }) {
    this.#SELECT_ALL = SELECT_ALL;
    this.#CAT_PAINTER = CAT_PAINTER;
    this.#rootPublicKey = _rootPublicKey;
  }

  //____________
  // utility
  _getAccessedMap(container, targetId) {
    const existingMap = container.get(targetId);
    if (existingMap) return existingMap;
    const newMap = new Map();
    container.set(targetId, newMap);
    return newMap;
  }

  //____________
  #storeReaction(tokenUUID, nodeUUID, token, reaction) {
    this.#reactionsByTokenUUID.set(tokenUUID, reaction);
    const tokensMap = this._getAccessedMap(this.#allTokensByNodeUUID, nodeUUID);
    tokensMap.set(token, tokenUUID);
  }
  
  //____________
  #removeByTokenUUID(tokenUUID) {
    let some = false;
    if (!tokenUUID) return some;
    clearTimeout(this.#delaysByTokenUUID.get(tokenUUID));
    some = this.#delaysByTokenUUID.delete(tokenUUID) || some;
    clearTimeout(this.#animationsByNodeUUID.get(tokenUUID));
    some = this.#animationsByNodeUUID.delete(tokenUUID) || some;
    clearTimeout(this.#toRepeatByTokenUUID.get(tokenUUID));
    some = this.#toRepeatByTokenUUID.delete(tokenUUID) || some;
    some = this.#nextFrameByTokenUUID.delete(tokenUUID) || some;
    some = this.#reactionsByTokenUUID.delete(tokenUUID) || some;
    return some;
  }

  //____________
  // executed internally or by destroyer api
  _removeReaction(unknownKey, nodeUUID, token, skipTokenUUID) {
    if (unknownKey !== this.#rootPublicKey) return false;
    const nodeTokens = this.#allTokensByNodeUUID.get(nodeUUID);
    if (!nodeTokens) return false;
    
    let some = false;
    if (token === undefined) { // multi tokens elimination
      const entries = Array.from(nodeTokens.entries());
      for (let i = entries.length - 1; i >= 0; i--) {
        const [token, tokenUUID] = entries[i];
        if (skipTokenUUID && skipTokenUUID === tokenUUID) continue;
        some = this.#removeByTokenUUID(tokenUUID) || some;
        nodeTokens.delete(token);
      }
      if (nodeTokens.size === 0) this.#allTokensByNodeUUID.delete(nodeUUID);
    }
    else { // single token elimination
      const tokenUUID = nodeTokens.get(token);
      if (skipTokenUUID && skipTokenUUID === tokenUUID) return false;
      some = this.#removeByTokenUUID(tokenUUID) || some;
      nodeTokens.delete(token);
      if (nodeTokens.size === 0) this.#allTokensByNodeUUID.delete(nodeUUID);
    }
    return some;
  }
  
  //____________
  #cancelTokensList(targetTokens, nodeUUID, isSelf, thisToken) {
    const ROOT_KEY = this.#rootPublicKey;
    for (const targetToken of targetTokens) {
      if (isSelf && thisToken === targetToken) continue;
      this._removeReaction(ROOT_KEY, nodeUUID, targetToken);
    }
  }

  //____________
  #cancelNodesList(targetNodes, thisNodeUUID, targetTokens, thisToken) {
    const ROOT_KEY = this.#rootPublicKey;
    const getThisTokenUUID = () => {
       const tokens = this.#allTokensByNodeUUID.get(thisNodeUUID);
       return tokens?.get(thisToken);
    }

    // each node of list
    for (const targetNode of targetNodes) {
      if (!targetNode) continue;
      const targetNodeUUID = targetNode._nodeUUID;
      const isSelf = targetNodeUUID === thisNodeUUID;

      // cancel selected tokens
      if (targetTokens.length !== 0) {
        this.#cancelTokensList(targetTokens, targetNodeUUID, isSelf, thisToken);
        continue;
      }

      // cancel all tokens
      const exception = isSelf ? getThisTokenUUID() : undefined;
      this._removeReaction(ROOT_KEY, targetNodeUUID, undefined, exception);
    }
  }

  //____________
  #handleRepetition(riskyRepeat) {
    if (typeof riskyRepeat === "number") {
      const newRiskyRepeat = riskyRepeat > 0 ? riskyRepeat - 1 : riskyRepeat;
      return { newRiskyRepeat, _delay: 0 };
    }

    // !Array.isArray(riskyRepeat) should be array
    if (riskyRepeat.length === 0) return { newRiskyRepeat: 0, _delay: 0 };
    const [ thisDelay, ...newRiskyRepeat ] = riskyRepeat;
    if (thisDelay >= 0) return { newRiskyRepeat, _delay: thisDelay };
    return { newRiskyRepeat: riskyRepeat, _delay: Math.abs(thisDelay) };
  }

  //____________
  // executed by event bus
  _setReaction(subscriber, reaction) {
    const {
      token,
      startAt,
      duration,
      riskyRepeat,
      cancelByToken,
      cancelBySelector,
      cancelBySelectorAll,
      _nodeUUID,
      _tokenUUID,
    } = reaction.config;

    // initial delay
    if (startAt !== 0) {
      const newReaction = { ...reaction, startAt: 0 };
      const newTimer = setTimeout(() => {
        this.#delaysByTokenUUID.delete(_tokenUUID);
        this.#processReaction(subscriber, newReaction);
      }, startAt);
      this.#delaysByTokenUUID.set(_tokenUUID, newTimer);
      this.#storeReaction(_tokenUUID, _nodeUUID, token, newReaction);
      return;
    }
    
    // local cancelation
    if (cancelByToken.length !== 0) {
      this.#cancelTokensList(cancelByToken, _nodeUUID, true, token);
    }

    // node cancelation
    if (cancelBySelector.length !== 0) {
      const [path, ...targetTokens] = cancelBySelector;
      const targetNode = this.#SELECT_ALL(path)?.[0];
      this.#cancelNodesList([targetNode], _nodeUUID, targetTokens, token);
    }

    // group cancelation
    if (cancelBySelectorAll.length !== 0) {
      const [path, ...targetTokens] = cancelBySelectorAll;
      const targetNodes = this.#SELECT_ALL(path);
      this.#cancelNodesList(targetNodes, _nodeUUID, targetTokens, token);
    }

    // repetition
    if (riskyRepeat !== 0) {
      const { newRiskyRepeat, _delay } = this.#handleRepetition(riskyRepeat);
      const newReaction = { ...reaction, riskyRepeat: newRiskyRepeat };
      const countdown = duration + _delay;
      if (countdown === 0) {
        this.#CAT_PAINTER?._forceNextFrame();
        this.#nextFrameByTokenUUID.set(_tokenUUID, [subscriber, newReaction]);
      }
      else {
        const newTimer = setTimeout(() => {
          this.#toRepeatByTokenUUID.delete(_tokenUUID);
          this._setReaction(subscriber, newReaction); // recursion!!!
        }, countdown);
        this.#toRepeatByTokenUUID.set(_tokenUUID, newTimer);
      }
      this.#storeReaction(_tokenUUID, _nodeUUID, token, newReaction);
    }
  
    // managers
    const timeManager = {} // getTimeManager(reaction); PENDING (useTime api)
    const newReaction = { ...reaction, timeManager };

    // snapshot
    if (duration === 0) {
      this.#processReaction(subscriber, reaction);
      return;
    }
    
    // animation
    this.#CAT_PAINTER?._startAnimating();
    const newTimer = setTimeout(() => {
      const animsByTokenUUID = this.#animationsByNodeUUID;
      animsByTokenUUID.delete(_nodeUUID);
      if (animsByTokenUUID.size !== 0) return;
      this.#CAT_PAINTER?._stopAnimating();
    }, duration);
    this.#animationsByNodeUUID.set(_nodeUUID, newTimer);
    this.#storeReaction(_tokenUUID, _nodeUUID, token, newReaction);
    this.#processReaction(subscriber, newReaction);
  }

  //____________
  // PENDING: state and data managers and expansions
  #processReaction(subscriber, reaction) {
    const { _passiveManager, _activeManager } = subscriber;
    const { middlewares, update, lastUpdate, data } = reaction;

    // local middlewares
    let keepGoing = true;
    for (const middleware of middlewares) {
      keepGoing = middleware({ state: _passiveManager, data });
      if (!keepGoing) break; // stop middlewares
      }
    if (!keepGoing) return; // skip this subscriber

    // updates
    let some = false;
    some = update({ state: _activeManager, data }) || some;
    some = lastUpdate({ state: _activeManager, data }) || some;
    if (some) this.#dirtyNodes.add(subscriber);
  }

  //____________
  // executed by state manager
  _scheduleNodes(nodes) {
    for (const node of nodes) {
      this.#dirtyNodes.add(node);
    }
  }

  //____________
  // executed by painter
  _getDirtyNodes() {
    const dirtyNodesSet = this.#dirtyNodes;
    const allDirtyNodes = Array.from(dirtyNodesSet);
    for (const node of dirtyNodesSet) {
      const nodeUUID = node._nodeUUID;
      if (this.#animationsByNodeUUID.has(nodeUUID)) continue;
      dirtyNodesSet.delete(nodeUUID);
    }

    const nextFrameMap = this.#nextFrameByTokenUUID;
    const entries = Array.from(nextFrameMap.entries());
    for (let i = entries.length - 1; i >= 0; i--) {
      const [tokenUUID, [subscriber, reaction]] = entries[i];
      nextFrameMap.delete(tokenUUID);
      this._setReaction(subscriber, reaction);
    }

    return allDirtyNodes;
  }

  //____________
  // executed by painter
  _subscribeToControl(painter) {
    this.#CAT_PAINTER = painter;
  }
}



/*
	//____________
	#createDataManager(data) {
		const thisBus = this;
		return {
			get: key => data[key],
			
			getByKeys: keys => keys.reduce((acc, key) => {
				acc[key] = data?.[key];
				return acc;
			}, {}),

			riskyPatch: (key, value) => {
				data[key] = value;
			},

			riskyPatchByObject: newData => {
				for (const [key, value] of Object.entries(newData)) {
					data[key] = value;
				}
			},

			riskyRelay: thisBus._emit, // args: channel, message, data
		}
	}




  //____________
  #processReaction(subscriber, reaction, data, dataManager) {

    const delay = reaction.config.startAt;
    if (delay > 0) {
      const delayedConfig = { ...reaction.config, startAt: 0 };
      const delayedSnapshot = { ...reaction, config: delayedConfig };
      setTimeout(() => {
        this.#processReaction(subscriber, delayedSnapshot, data);
      }, delay);
      return;
    }

    for (const validation of reaction.validations) {
      if (validation(subscriber._passiveManager, dataManager)) continue;
      return;
    }

    const rxSymbol = Symbol(reaction.config.token);
		reaction.__rxSymbol = rxSymbol;
    reaction.__subscriber = subscriber;
    reaction.__reaction = reaction;
    reaction.__dataManager = dataManager;

		const isSnap = reaction.config.duration === 0;
    if (isSnap) this.#RX_MANAGER._setSnapshot(subscriber, reaction, rxSymbol);
    else this.#RX_MANAGER._setSequence(subscriber, reaction, rxSymbol);
    // always: repeat, cancelByToken, cancelBySelector, cancelBySelectorAll
    // sequence only: duration, useTime, useTimeBezier, useTimeSteps
    
		const fakeTimeManager = { get: () => 0, riskyPatch: () => {} };
    const realTimeManager = this.#RX_MANAGER._getTimeManager(rxSymbol);
		const timeManager = isSnap ? fakeTimeManager : realTimeManager;
    reaction.update(subscriber._activeManager, dataManager, timeManager);

    for (const relay of reaction.relays) {
      this.#processRelay(subscriber, relay, data);
    }
  }

	//____________
	#processRelay(subscriber, relay, data) {
		if (relay.channels.length === 0) {
			this._emit(subscriber.nodeId, data.message, data);
			return;
		}

		for (const channel of relay.channels) {
			if (channel !== "#") this._emit(channel, data.message, data);
			else this._emit(subscriber.nodeId, data.message, data);
		}
	}
*/