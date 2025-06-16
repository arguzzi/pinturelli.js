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
	#removedId = new Set();
  #bus = new Map();
  #dispatcher;
  #allNodes;
  #painter;
  
  //____________
  // will be freezed!!!
  constructor({ ALL_NODES, PAINTER, DISPATCHER }) {
    this.#dispatcher = DISPATCHER;
    this.#allNodes = ALL_NODES;
    this.#painter = PAINTER;
  }
  
  //____________
  _removeNodeReferences(nodeId) {
		this.#removedId.add(nodeId);
		setTimeout(() => {
			this.#bus.delete(nodeId);
	
			const channelsToDelete = [];
			const messagesToDelete = [];
	
			for (const [channelId, messages] of this.#bus) {
				for (const [message, receivers] of messages) {
					const wasRemoved = receivers.delete(nodeId);
					if (wasRemoved && receivers.size === 0) {
						messagesToDelete.push({ channelId, message });
					}
				}
			}
			
			for (const { channelId, message } of messagesToDelete) {
				const messages = this.#bus.get(channelId);
				messages.delete(message);
				if (messages.size === 0) {
					channelsToDelete.push(channelId);
				}
			}
			
			for (const channelId of channelsToDelete) {
				this.#bus.delete(channelId);
			}

			// this.#dispatcher.unsubscribe // PENDING
		}, 0);
	}

  //____________
  _listen(channelId, message, receiverId, description) {
		this.#removedId.delete(channelId);
		this.#removedId.delete(receiverId);
    const thisBus = this.#bus;

    // if (channelId === "$") dispatcher.subscribe // PENDING

    const hasChannel = thisBus.has(channelId);
    const channel = hasChannel ? thisBus.get(channelId) : new Map();
    if (!hasChannel) thisBus.set(channelId, channel);

    const hasReceiver = hasChannel && channel.has(message);
    const receiverIds = hasReceiver ? channel.get(message) : new Map();
    if (!hasReceiver) channel.set(message, receiverIds);

    receiverIds.set(receiverId, description);
    
    if (channelId !== "$") return;
    const requestedData = description.firstConfig.requestData;
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
	#createDataManager(data) {
		const thisBus = this;
		return {
			get: key => data?.[key],
			
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
  _emitOnPrimaryChannel(data) { // provisional
    // dispatcher should handle this internally. for targeted dispatch
    this._emit("$", data.$semantic_name, data);
  }

  //____________
  _emit(channelId, message, data) {
		if (this.#removedId.has(channelId)) return;
    const channel = this.#bus.get(channelId);
    if (!channel) return; // no one is listening this channel
    const receiverIds = channel.get(message);
    if (!receiverIds) return; // no one is listening this message

		data.message = message;
		const dataManager = this.#createDataManager(data);

    const emptyNodeIds = [];
    receiverIds.forEach((description, receiverId) => {
      const receiver = this.#allNodes.get(receiverId);
      
      if (!receiver) {
        emptyNodeIds.push(receiverId);
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
        this._emit(receiverId, message, data);
      }

      // each reaction
      for (const reaction of description.reactions) {
        this.#processReaction(receiver, reaction, data, dataManager);
      }
    });

    // it shouldnt happen
    for (const emptyNodeId of emptyNodeIds) {
      receiverIds.delete(emptyNodeId);
      this._removeNodeReferences(emptyNodeId);
    }
    if (receiverIds.size === 0) channel.delete(message);
  }

  //____________
  #processReaction(receiver, reaction, data, dataManager) {

    const delay = reaction.config.startAt;
    if (delay > 0) {
      const delayedConfig = { ...reaction.config, startAt: 0 };
      const delayedSnapshot = { ...reaction, config: delayedConfig };
      setTimeout(() => {
        this.#processReaction(receiver, delayedSnapshot, data);
      }, delay);
      return;
    }

    for (const validation of reaction.validations) {
      if (validation(receiver._passiveManager, dataManager)) continue;
      return;
    }

    const rxSymbol = Symbol(reaction.config.token);
		reaction.__rxSymbol = rxSymbol;
    reaction.__receiver = receiver;
    reaction.__reaction = reaction;
    reaction.__dataManager = dataManager;

		const isSnap = reaction.config.duration === 0;
    if (isSnap) this.#painter._setSnapshot(receiver, reaction, rxSymbol);
    else this.#painter._setSequence(receiver, reaction, rxSymbol);
    // always: repeat, cancelByToken, cancelBySelector, cancelBySelectorAll
    // sequence only: duration, useTime, useTimeBezier, useTimeSteps
    
		const fakeTimeManager = { get: () => 0, riskyPatch: () => {} };
    const realTimeManager = this.#painter._getTimeManager(rxSymbol);
		const timeManager = isSnap ? fakeTimeManager : realTimeManager;
    reaction.update(receiver._activeManager, dataManager, timeManager);

    for (const relay of reaction.relays) {
      this.#processRelay(receiver, relay, data);
    }
  }

	//____________
	#processRelay(receiver, relay, data) {
		if (relay.channels.length === 0) {
			this._emit(receiver.nodeId, data.message, data);
			return;
		}

		for (const channel of relay.channels) {
			if (channel !== "#") this._emit(channel, data.message, data);
			else this._emit(receiver.nodeId, data.message, data);
		}
	}
}
