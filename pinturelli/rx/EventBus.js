import dbgr from "../debug/validateEventBus.js";

//////////////////////////////
//
// dynamic registry to organize event reactions by:
// 1) publisher id, 2) event name, 3) subscriber id.
// --------------
//
//  #registry = {
//    pubId<STRING>: {
//      event$name<STRING>: {
//        subId<STRING>: <ARRAY[<FUNCTION>]>(callbacks),
//        subId<STRING>: <ARRAY[<FUNCTION>]>(callbacks),
//      },
//      event$name<STRING>: {subId<STRING>, subId<STRING>...},
//      event$name<STRING>: {subId<STRING>, subId<STRING>...},
//    },
//    pubId<STRING>: {event$name<STRING>, event$name<STRING>...},
//    pubId<STRING>: {event$name<STRING>, event$name<STRING>...},
//  }
//
// --------------
// "callbacks" is an array of middleware functions,
// the last one is the target function.
// --------------
//
//  (callbacks) = [<FUNCTION>(middleware)..., <FUNCTION>(callback)]
//
// --------------
// the functions are executed sequentially from left to right,
// with each one receiving: the event (object) as the first agument
// and the publisher/subscriber (nodes) as the 2nd/3rd arguments.
// the execution chain stops if any middleware returns false.
//
// if final callback return a string: it is recognized as an event$name
// and is published again as a new event (with subId now being pubId)
//
//////////////////////////////

export default class EventBus {
  #registry;
  
  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL) {
    this.GLOBAL = GLOBAL;
    this.DEBUG = GLOBAL.CONFIG.DEBUG;
    this.#registry = new Map();
  }

  //____________
  publish(pubId, event$name, $data) {
    if (this.DEBUG) dbgr.pubParams(this.GLOBAL, pubId, event$name);

    if (!this.#registry.has(pubId)) return;
    const events = this.#registry.get(pubId);

    if (!events.has(event$name)) return;
    const subscribers = events.get(event$name);

    const { ALL_NODES } = this.GLOBAL;
    const publisher = ALL_NODES.get(pubId);

    subscribers.forEach((callbacks, subId) => {
      const subscriber = ALL_NODES.get(subId);

      for (let i = 0; i < callbacks.length; i++) {

        // middlewares chained execution
        if (i < callbacks.length - 1) {
          if (callbacks[i]($data, publisher, subscriber) === false) return;
          continue;
        }

        // final callback
        const nextEvent = callbacks[i]($data, publisher, subscriber);
        if (this.DEBUG) dbgr.typedParams.string("Event Bus (next)", nextEvent);
        if (nextEvent) this.publish(subId, nextEvent.$name, nextEvent);
      }
    });
  }

  //____________
  subscribe(pubId, event$name, subId, callbacks) {
    if (this.DEBUG) dbgr.subParams(this.GLOBAL, pubId, event$name, subId, callbacks);

    if (!this.#registry.has(pubId)) this.#registry.set(pubId, new Map());
    const events = this.#registry.get(pubId);

    if (!events.has(event$name)) events.set(event$name, new Map());
    const subscribers = events.get(event$name);

    subscribers.set(subId, callbacks);
  }
  
  //____________
  // reminder:
  // #registry[publisherId][event$name][subscriberId] = callbacksArray
  unsubscribe(pubId, event$name, subId) {
    if (this.DEBUG) dbgr.unsubParams(this.GLOBAL, pubId, event$name, subId);
    
    if (!this.#registry.has(pubId)) return;
    const events = this.#registry.get(pubId);

    if (!events.has(event$name)) return;
    const subscribers = events.get(event$name);

    subscribers.delete(subId);
    if (subscribers.size === 0) events.delete(event$name);
    if (events.size === 0) this.#registry.delete(pubId);
  }
}
