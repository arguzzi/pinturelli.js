import params from "./contextPipelinesParams.js";

const EXIT_CODE = Object.freeze({
  REJECTED: 0,
  COMPLETED: 1,
  UNKNOWN_EVENT_TYPE: 2,
});

const DEBOUNCED_EVENTS_SUFFIXES = new Map([
  ["soft-debounced", params.RESIZE_SOFT_DEBOUNCED_FILTER],
  ["hard-debounced", params.RESIZE_HARD_DEBOUNCED_FILTER],
  ["activator-debounced", params.RESIZE_ACTIVATOR_COUNTDOWN],
]);

//////////////////////////////
//
const processResizeData = (_state, newState, $name) => {
  const $data = new Map([newState.$data, ["$name", $name]]);
  const watchedValue = _state["_watchedName_" + $name];
  const now = performance.now();

  // is-activator data needed
  if (watchedValue.includes("ctx$is-activator")) {
    if (Object.hasOwn(_state, "_isActivatorCache")) {
      $data.set("ctx$is-activator", _state._isActivatorCache);
    }
    else {
      const elapsed = now - _state._lastResizeEmittedAt;
      const isActivator = elapsed > params.RESIZE_ACTIVATOR_COUNTDOWN;
      $data.set("ctx$is-activator", isActivator);
    }
  }

  // is-visual data needed
  if (watchedValue.includes("ctx$is-visual")) {
    const isVisual = !!window.visualViewport;
    $data.set("ctx$is-visual", isVisual);
  }

  // output
  return {
    ...newState,
    exitCode: EXIT_CODE.COMPLETED,
    $data,
    _lastResizeEmittedAt: now,
  }
}

//////////////////////////////
//
// its not the original debounce, this one is more beautiful
const adaptiveDebounceFilter = (_e, _state, $name, delay) => {
  const allTimers = _state.__debouncingTimers__;
  const now = performance.now();
  const elapsed = now - _state._lastResizeEmittedAt;
  const isTheFirstOne = elapsed > params.RESIZE_ACTIVATOR_COUNTDOWN;
  _state._isActivatorCache = isTheFirstOne; // just saving for future use
  // first execution
  if (isTheFirstOne) {
    allTimers.set($name, { lastCall: now, timeout: null }); // actual timestamp
    return false; // isnt deferred (will emit response)
  }

  // not first execution
  const thisTimer = allTimers.get($name) || { lastCall: 0, timeout: null };
  const difference = now - thisTimer.lastCall;
  const isDelayed = difference > delay;

  // if the delay has passed
  if (isDelayed) {
    thisTimer.lastCall = performance.now(); // actual timestamp
    thisTimer.timeout = setTimeout(() => {
      thisTimer.lastCall = performance.now(); // future timestamp
      const response = processResizeData(_state, _state, $name);
      _state.__contextOutput__(_e, response); // additional emission
      // this callback maybe will be overwritten by next filtered state
    }, delay); // <<<==={ new timer, with complete duration delay.
    return false; // isnt deferred (will emit this state)
  }
  
  // if the delay hasnt passed yet
  const remaining = delay - difference;
  clearTimeout(thisTimer.timeout); // discard the old timer (along with...
  // ...its callback) to prevent a call with outdated state
  thisTimer.timeout = setTimeout(() => {
    thisTimer.lastCall = performance.now(); // near future timestamp
    const response = processResizeData(_state, _state, $name);
    _state.__contextOutput__(_e, response); // overwriting the last one...
    // ...and maybe this one will be overwritten again (not a good life, uwu)
  }, remaining); // <<<==={ new timer, but shorter than last one.
  return true // is deferred (so wont emit this state now)
  // pd: lastCall is not modified in this case. the only thing updated was the
  // timeout and its callback. if executed, the new callback will have a better
  // visual impact (and efficiency is almost the same as the traditional way).
  // the debounce filter hit me so hard :c it took me two days to understand it
}

//////////////////////////////
//
const handleResizeEvent = (_e, _state, prefix, suffix) => {
  const $name = prefix + suffix;
  const prop = "_watchedName_" + $name;
  const pending = "_watchedName_" + prefix;

  // RECURSION UPDATE. do not modify this line or the base case!!!
  const { [prop]: removedProperty, ...newState } = _state;
  
  // emit actual response
  const response = processResizeData(_state, newState, $name)
  _state.__contextOutput__(_e, response);
  
  // RECURSION BASE CASE.  prevents call stack overflow!!!
  const hasMore = Object.keys(newState).some(key => key.startsWith(pending));
  if (!hasMore) return; // if no pending _watchedName_ properties, stop here
  
  // ...otherwise, call recursion
  resizePipeline(_e, newState); // process the updated state
}

//////////////////////////////
//
const resizePipeline = (_e, _state) => {
  const _watch = "_watchedName_";
  const prefix = "ctx$resizing-";

  //____________
  // @> native resize
  if (Object.hasOwn(_state, _watch + prefix + "native")) {
    handleResizeEvent(_e, _state, prefix, "native");
    return;
  }

  //____________
  // @> automatic throttle filter
  const elapsed = performance.now() - _state._lastResizeEmittedAt;
  if (
    !_state.__checkpoints__.has("automatic-throttle-filter") &&
    elapsed < _state._painterDeltaTime
  ) {
    const $log = `F@> automatic throttle filter (resize)`;
    const $data = new Map([["$log", $log]]);
    _state.__contextOutput__(null, { 
      exitCode: EXIT_CODE.REJECTED,
      $data
    });
    return;
  }
  _state.__checkpoints__.add("automatic-throttle-filter");

  //____________
  // @> normal resize
  if (Object.hasOwn(_state, _watch + prefix + "normal")) {
    handleResizeEvent(_e, _state, prefix, "normal");
    return;
  }

  //____________
  // debounced events
  for (const [suffix, delay] of DEBOUNCED_EVENTS_SUFFIXES) {
    const $name = prefix + suffix;
    const prop = _watch + $name;

    if (Object.hasOwn(_state, prop)) {
      
      // @> debounce filter
      const isDeferred = adaptiveDebounceFilter(_e, _state, $name, delay);
      if (isDeferred) {
        const $log = `F@> ${delay}ms debounce filter (resize)`;
        const $data = new Map([["$log", $log]]);
        _state.__contextOutput__(null, {
          exitCode: EXIT_CODE.REJECTED,
          $data
        });
        continue;
      }
      
      // @> or emit actual state
      const response = processResizeData(_state, _state, $name)
      _state.__contextOutput__(_e, response);
    }
  }
}

//////////////////////////////
//
//  _state = {
//    exitCode: 0/1/2,
//    $data: new Map([[dataName, dataValue]]),
//    _painterDeltaTime: this.SKETCH.deltaTime,
//    _watchedName_"$name1": isActivatorFlagNeeded?,
//    _watchedName_"$name2": isActivatorFlagNeeded?,
//    _watchedName_"$...": isActivatorFlagNeeded?...,
//    _lastResizeEmittedAt: performace.now(),
//    _lastFullscrEmittedAt: performace.now(),
//    __contextOutput__: EMITTER.contextOutput,
//    __debouncingTimers__: new Map([[timer, {lastCall, timeout}]]),
//  }
const contextPipeline = (_e, _state) => {
  
  //____________
  // @> resize pipeline
  if (_e.type === "resize") {
    resizePipeline(_e, _state);
    return;
  }

  //____________
  // @> unknown event
  if (_e.type !== "fullscreenchange") {
    const $log = `2@> unknown event type in context pipe: ${_e.type}`;
    const $data = new Map([["$log", $log]]);
    _state.__contextOutput__(null, {
      exitCode: EXIT_CODE.UNKNOWN_EVENT_TYPE,
      $data,
    });
    return;
  }

  //____________
  // @> fullscreen
  const $name = !!document.fullscreenElement
    ? "ctx$fullscreen-opened"
    : "ctx$fullscreen-closed";
  const $data = new Map([["$name", $name]]);
  _state.__contextOutput__(_e, {
    ..._state,
    exitCode: EXIT_CODE.COMPLETED,
    $data,
    _lastFullscrEmittedTimestam: performance.now(),
  });
}

//////////////////////////////
//
export default contextPipeline;

