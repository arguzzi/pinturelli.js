// import dbgr from "../debug/validateEventBus.js";

//////////////////////////////
//
// bus to organize event reactions (descriptions) by:
// 1) channelId, 2) message, 3) receiverId.
// --------------
//
//  #bus = channelIdsMap{
//    channelId: expectedMessagesMap{
//      message: receiverIdsMap{
//        receiverId: description,
//        receiverId: description,
//      },
//      message: receiverIdsMap{ receiverId: description, receiverId: ...},
//      message: receiverIdsMap{ receiverId: description, receiverId: ...},
//    },
//    channelId: expectedMessagesMap{ message, message, ...},
//    channelId: expectedMessagesMap{ message, message, ...},
//  }
//
//////////////////////////////

export default class EventBus {
  #allNodes;
  #dispatcher;
  #painter;
  #bus;
  
  //____________
  // will be freezed!!!
  constructor(allNodes, dispatcher, painter) {
    this.#allNodes = allNodes;
    this.#dispatcher = dispatcher;
    this.#painter = painter;
    this.#bus = new Map();
  }
  
  //____________
  _removeNodeReferences(nodeId) {
    // search in all channels where this node is listening
    // not now, maybe async or when are no reactions pending
    // remember: check channels and messages empty maps!!!
    this.#bus.delete(nodeId);
  }

  //____________
  _listen(channelId, message, receiverId, reactionCallback) {
    const bus = this.#bus;

    // if (channelId === "$") dispatcher.subscribe PENDING

    const hasChannel = bus.has(channelId);
    const channel = hasChannel ? bus.get(channelId) : new Map();
    if (!hasChannel) bus.set(channelId, channel);

    const hasReceiver = hasChannel && channel.has(message);
    const receiverIds = hasReceiver ? channel.get(message) : new Map();
    if (!hasReceiver) channel.set(message, receiverIds);

    receiverIds.set(receiverId, reactionCallback);
    
    if (channelId !== "$") return;
    const requestedData = reactionCallback.firstConfig.requestData;
    this.#dispatcher._setRequestedData(message, receiverId, requestedData);
  }
  
  //____________
  _stopListening(channelId, message, receiverId) {
    const channel = this.#bus.get(channelId);
    if (!channel) return; // no one is listening this channel
    const receiverIds = channel.get(message);
    if (!receiverIds) return; // no one is listening this message

    receiverIds.delete(receiverId);

    if (receiverIds.size === 0) channel.delete(message);
    if (channel.size === 0) this.#bus.delete(channelId);
  }

  //____________
  _primaryDispatcherSpeak(data) { // provisional
    // dispatcher should handle this internally. for targeted dispatch
    this._speak("$", data.$event_name, data);
  }

  //____________
  _speak(channelId, message, data) {
    const channel = this.#bus.get(channelId);
    if (!channel) return; // no one is listening this channel
    const receiverIds = channel.get(message);
    if (!receiverIds) return; // no one is listening this message

    const deletedNodeIds = [];

    receiverIds.forEach((description, receiverId) => {
      const receiver = this.#allNodes.get(receiverId);
      
      if (!receiver) {
        deletedNodeIds.push(receiverId);
        console.log("invalid receiverId in event bus!!!!", receiverId);
        return; // cancels the current execution of the forEach, not all of them
      }

      // first middlewares
      for (const validation of description.firstValidations) {
        if (validation(receiver._passiveManager, data)) continue;
        return; // cancels the current execution of the forEach, not all of them
      }

      // automatic re-emition
      if (description.firstConfig.propagation) {
        this._speak(receiverId, message, data);
      }

      // each reaction
      for (const reaction of description.reactions) {
        this.#processReaction(receiver, reaction, data);
      }
    });

    // it shouldnt happen
    for (const deletedNodeId of deletedNodeIds) {
      receiverIds.delete(deletedNodeId);
      _removeNodeReferences(deletedNodeId);
    }
    if (receiverIds.size === 0) channel.delete(message);
  }

  //____________
  #processReaction(receiver, reaction, data) {
    const delay = reaction.config.startAt;
    
    if (delay > 0) {
      const delayedConfig = { ...reaction.config, startAt: 0 };
      const delayedSnapshot = { ...reaction, config: delayedConfig };
      setTimeout(() => {
        this.#processReaction(receiver, delayedSnapshot, data);
      }, delay);
      return;
    }

    reaction.config.__receiver = receiver;
    reaction.config.__reaction = reaction;
    reaction.config.__data = data;

    const rxSymbol = Symbol(reaction.config.token);
    this.#painter._setReaction(rxSymbol, reaction.config);
    // always: repeat, cancelByToken, cancelBySelector, cancelBySelectorAll
    // sequence only: duration, useTime, useTimeBezier, useTimeSteps

    for (const validation of reaction.validations) {
      if (validation(receiver._passiveManager, data)) continue;
      this.#painter._cancelReaction(rxSymbol);
      return;
    }
    
    const time = this.#painter._getTimeManager(rxSymbol);
    reaction.update(receiver._activeManager, data, time);

    for (const relay of reaction.relays) {
      if (relay.channels.length === 0) {
        this._speak(receiver.nodeId, data.message, data);
        continue;
      }

      relay.channels.forEach(channel => {
        if (channel !== "#") this._speak(channel, data.message, data);
        else this._speak(receiver.nodeId, data.message, data);
      });
    }
  }
}
