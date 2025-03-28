import dbgr from "../debug/validateEventBus.js";

//////////////////////////////
//
// dynamic registry to organize event reactions by:
// 1) publisher id, 2) event name, 3) subscriber id.
// --------------
//
//    #registry = {
//      pubId: {
//        event: {
//          subId: callbacks,
//          subId: callbacks,
//        },
//        event: {subId, subId...},
//        event: {subId, subId...},
//      },
//      pubId: {event, event...},
//      pubId: {event, event...},
//    }
//
// --------------
// "callbacks" is an array of middleware functions,
// the last one is the target function.
// --------------
//
//    callbacks = [middlewares, middlewares..., callback]
//
// --------------
// the functions are executed sequentially from left to right, with each
// receiving the publisher/subscriber nodes as the 1st/2nd argument.
// the execution chain stops if any function returns false.
//
//////////////////////////////

export default class EventBus {
  #registry;
  
  //____________
  constructor(GLOBAL) {
    this.GLOBAL = GLOBAL;
    this.DEBUG = GLOBAL.CONFIG.debug;
    this.#registry = new Map();
  }

  //____________
  publish(pubId, event) {
    if (this.DEBUG) dbgr.pubParams(this.GLOBAL, pubId, event);

    if (!this.#registry.has(pubId)) return;
    const events = this.#registry.get(pubId);

    if (!events.has(event)) return;
    const subscribers = events.get(event);

    const { ALL_NODES } = this.GLOBAL;
    const publisher = ALL_NODES.get(pubId);

    for (const [subId, callbacks] of subscribers) {
      const subscriber = ALL_NODES.get(subId);

      for (let i = 0; i < callbacks.length; i++) {
        if (callbacks[i](publisher, subscriber) === false) break;
      }
    }
  }

  //____________
  subscribe(pubId, event, subId, callbacks) {
    if (this.DEBUG) dbgr.subParams(this.GLOBAL, pubId, event, subId, callbacks);

    if (!this.#registry.has(pubId)) this.#registry.set(pubId, new Map());
    const events = this.#registry.get(pubId);

    if (!events.has(event)) events.set(event, new Map());
    const subscribers = events.get(event);

    subscribers.set(subId, callbacks);
  }
  
  // helpful reminder:
  // #registry[publisherId][eventName][subscriberId] = callbacksArray
  
  //____________
  unsubscribe(pubId, event, subId) {
    if (this.DEBUG) dbgr.unsubParams(this.GLOBAL, pubId, event, subId);
    
    if (!this.#registry.has(pubId)) return;
    const events = this.#registry.get(pubId);

    if (!events.has(event)) return;
    const subscribers = events.get(event);

    subscribers.delete(subId);
    if (subscribers.size === 0) events.delete(event);
    if (events.size === 0) this.#registry.delete(pubId);
  }
}
