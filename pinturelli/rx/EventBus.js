// import dbgr from "../debug/validateEventBus.js";

//////////////////////////////
//
//  bus = Map [channelId: (Map message: {Map subscriberId: description})] 
//     -> channel       -> message    -> subscriber      : descrition
//
//////////////////////////////

export default class EventBus {
  #bus = new Map(); // local memory
  #deadIdsToClean = new Set();
  #rootPublicKey = null;
  #getAccessedMap;
  #All_NODES;
  #RX_MANAGER;
  #DISPATCHER;
  
  //____________
  // will be freezed!!!
  constructor({ ALL_NODES, RX_MANAGER, _rootPublicKey }) {
    this.#All_NODES = ALL_NODES;
    this.#RX_MANAGER = RX_MANAGER;
    this.#getAccessedMap = RX_MANAGER._getAccessedMap;
    this.#rootPublicKey = _rootPublicKey;

    // DUMMY TEST
    setTimeout(() => {
      this._publish("$", "$tapped", { $semantic_name: "$tapped"});
      console.log("emited dummy", this.#bus);
    }, 2000);
  }

  //____________
  _setRxConnection(DISPATCHER) {
    this.#DISPATCHER = DISPATCHER;
  }
  
  //____________
  _subscribe(channelId, message, subscriberId, description) {
    // if (channelId === "$") dispatcher.subscribe // PENDING
    const channelMap = this.#getAccessedMap(this.#bus, channelId);
    const messageMap = this.#getAccessedMap(channelMap, message);
    messageMap.set(subscriberId, description);
  }
  
  //____________
  _unsubscribeChannel(channelId, subscriberId) {
    const channelMap = this.#bus.get(channelId);
    if (!channelMap) return; // no sub is listening this channel
    const emptyMessages = [];
    for (const [message, messageMap] of channelMap) {
      const wasDeleted = messageMap.delete(subscriberId);
      if (wasDeleted && messageMap.size === 0) emptyMessages.push(message);
    }
    for (const message of emptyMessages) {
      channelMap.delete(message);
    }
    if (channelMap.size === 0) this.#bus.delete(channelId);
  }

  //____________
  _unsubscribeMessage(channelId, message, subscriberId) {
    const channelMap = this.#bus.get(channelId);
    if (!channelMap) return; // no sub is listening this channel
    const messageMap = channelMap.get(message);
    if (!messageMap) return; // no sub is listening this message
    const wasDeleted = messageMap.delete(subscriberId);
    if (wasDeleted && messageMap.size === 0) channelMap.delete(message);
    if (channelMap.size === 0) this.#bus.delete(channelId);
  }

	//____________
  _publish(channelId, message, data) {
    const channelMap = this.#bus.get(channelId);
    if (!channelMap) return; // no sub is listening this channel
    const messageMap = channelMap.get(message);
    if (!messageMap) return; // no sub is listening this message

    // required data
    if (message.startsWith("$") && !data._isRelay) {
      this.#DISPATCHER._handleRequirement(channelId, message, data);
    }

    // each subscriber
    for (const [subscriberId, description] of messageMap) {
      const subscriber = this.#All_NODES.get(subscriberId);
      if (!subscriber) {
        this.#deadIdsToClean.add(subscriberId);
        continue;
      }

      const { firstConfig, firstMiddlewares, reactions } = description;
      const { riskyRepublishing, riskyBubbling } = firstConfig;

      // first middlewares
      let keepGoing = true;
      for (const middleware of firstMiddlewares) {
        keepGoing = middleware(subscriber._passiveManager, data);
        if (!keepGoing) break; // stop middlewares
      }
      if (!keepGoing) continue; // skip this subscriber
      
      // automatic propagation
      if (riskyBubbling) {
        this.#DISPATCHER._handleBubbling(subscriber, message, data);
      }
      if (riskyRepublishing && channelId !== subscriberId) {
        this._publish(subscriberId, message, data);
      }

      // delegate reactions
      for (const reaction of reactions) {
        const newReaction = { ...reaction, data };
        this.#RX_MANAGER._setReaction(subscriber, newReaction);
      }
    }
  }

  //____________
  _publishOnPrimaryChannel(data) { // PENDING
    // dispatcher should handle this internally (targeted dispatch)
    this._publish("$", data.$semantic_name, data);
  }
  
  //____________
  // PENDING: batch. add ids list to deadIds and force maintenance
  // then -> clean dead ids in one pass over the complete event bus
  _removeReferences(targetId, unknownKey) {
    let some = false;
    if (unknownKey !== this.#rootPublicKey) return some;

    const emptyChannelIds = new Set(); // [channelId, channelId, ...]
    const emptyMessages = new Set(); // [{message, channelMap, channelId}, ...]
    
    // remove channel
    some = this.#bus.delete(targetId) || some;
      
    // remove subscriber
    for (const [channelId, channelMap] of this.#bus) {
      for (const [message, messageMap] of channelMap) {
        some = messageMap.delete(targetId) || some;
        
        // last subscriber case
        if (messageMap.size !== 0) continue;
        emptyMessages.add({ message, channelMap, channelId });
      }
    }
    
    // side effects
    for (const { message, channelMap, channelId } of emptyMessages) {
      channelMap.delete(message);

      // last message case
      if (channelMap.size !== 0) continue;
      emptyChannelIds.add(channelId);
    }

    // side effects of side effects
    for (const channelId of emptyChannelIds) {
      this.#bus.delete(channelId);
    }

    return some;
  }

  //____________
  _runMaintenanceTasks(unknownKey) {
    // PENDING. refactor to batch
    let some = false;
    const rootPublicKey = this.#rootPublicKey;
    if (unknownKey !== rootPublicKey) return some;
    for (const targetId of this.#deadIdsToClean) {
      some = this._removeReferences(targetId, rootPublicKey) || some;
    }
    this.#deadIdsToClean.clear();
    return some;
  }
}
