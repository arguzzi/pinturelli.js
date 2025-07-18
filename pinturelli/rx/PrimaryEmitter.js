// import dbgr from "../debug/validateEmitter.js";

export default class PrimaryEmitter {
  #contextPipeline;
  #contextWatchedNames
  #contextGlobalState;
  #contextMemory;
  
  #gesturesPipeline;
  #gesturesWatchedNames;
  #gesturesActiveNames;
  #gesturesMemory;

  //____________
  // public properties will be freezed!!!
  constructor({ DISPATCHER, SKETCH }, pipelines) {
    this.DEBUG = false;
    this.DISPATCHER = DISPATCHER;
    this.SKETCH = SKETCH;
    
    // context initializations
    this.#contextPipeline = pipelines.contextPipeline;
    this.#contextWatchedNames = {};
    this.#contextGlobalState = {
      __contextOutput__: this.contextOutput.bind(this),
      __debouncingTimers__: new Map(),
    }
    this.#contextMemory = {
      _lastResizeEmittedAt: 0,
      _lastFullscrEmittedAt: 0,
    }

    // gestures initializations
    this.#gesturesPipeline = pipelines.gesturesPipeline;
    this.#gesturesWatchedNames = {};
    this.#gesturesActiveNames = {};
    this.#gesturesMemory = {
      event: null,
      isPressed: false,
      temporalCache: new Map(),
      activePointersIds: new Set(),
      activeGesturesInfo: new Map(),
      lastPointermovedInfo: new Map([["time", 0], ["cnvX", 0], ["cnvY", 0]]),
      _debouncingTimers: new Map(),
      _gesturesOutput: this.gesturesOutput.bind(this),
    }

    DISPATCHER._setRxConnection(this);
  }

  //////////////////////////////
  //
  // CONTEXT SEMANTIC SYSTEM
  //
  // inputs:
  // -> "resize"
  // -> "fullscreenchange"
  //
  // outputs:
  // -> "ctx$resizing-native"
  // -> "ctx$resizing-normal"
  // -> "ctx$resizing-soft-debounced"
  // -> "ctx$resizing-hard-debounced"
  // -> "ctx$resizing-activator-debounced"
  // -> "ctx$fullscreen-opened"
  // -> "ctx$fullscreen-closed"
  //____________
  // mutation here!
  updateContextWatchedNames(watchedNames) {
    // if (this.DEBUG) dbgr.watchedNamesParams(watchedNames);
    this.#contextWatchedNames = watchedNames.reduce((acc, obj) => ({
      ["_watchedName_" + obj.$semantic_name]: obj.required,
      ...acc,
    }), {});
    return 1223455;
  }
  //____________
  // mutation here!
  #updateContextMemory(_state) {
    this.#contextMemory._lastResizeEmittedAt = _state._lastResizeEmittedAt;
    this.#contextMemory._lastFullscrEmittedAt = _state._lastFullscrEmittedAt;
  }
  //
  //////////////////////////////

  //____________
  #contextStateGenerator() {
    return {
      exitCode: null, // local (always new, must be setted in the pipelines)
      $data: new Map(), // local, and always deep cloned in the pipelines
      ...this.#contextWatchedNames, // local (snapshot of a changing reference)
      _painterDeltaTime: this.SKETCH.deltaTime, // local (snapthot of...)
      ...this.#contextMemory, // global primitive props, alwways cloned
      __checkpoints__: new Set(), // never deep cloned, but local (not global)
      ...this.#contextGlobalState, // global props are never deep cloned
    }
  }

  //____________
  contextInput(_e) {
    const _state = this.#contextStateGenerator();
    console.log("\n\n__.__.-< New State >-.__.__\n", _state);
    this.#contextPipeline(_e, _state);
  }

  //____________
  // exitCode:
  // -> 0 = rejected
  // -> 1 = completed
  // -> 2 = error. unknown event type
  contextOutput(_e, _state) {
    if (_state.exitCode === 1) {
      _e.$data = _state.$data;
      this.#updateContextMemory(_state);
      this.DISPATCHER.emitterInput(_e, _state);
      return;
    }
    
    if (this.DEBUG && _state.exitCode !== 0) {
      // dbgr.errorCase(_state);
    }
  }

  //////////////////////////////
  //
  // GESTURES SEMANTIC SYSTEM:
  //
  // inputs:
  // -> "pointerdown"
  // -> "pointermove"
  // -> "pointercancel"
  // -> "pointerup"
  // outputs:
  // -> "$gesture_started"
  // -> "$gesture_cancelled"
  // -> "$tapped"
  //____________
  // mutation here!
  updateGesturesWatchedNames(watchedNames, isPointermoveNeeded = false) {
    if (this.DEBUG) dbgr.watchedNamesParams(watchedNames);
    this.#gesturesWatchedNames = watchedNames.reduce((acc, obj) => ({
      ["_watchedName_" + obj.$semantic_name]: obj.required,
      ...acc,
    }), {});
    this.#gesturesWatchedNames.isPointermoveNeeded = isPointermoveNeeded;
  }
  //____________
  // mutation here!
  updateGesturesActiveNames(activeNames) {

    if (this.DEBUG) dbgr.activeNamesParams(activeNames);
    this.#gesturesActiveNames = activeNames.reduce((acc, $semantic_name) => ({
      ["_activeName_" + $semantic_name]: true,
      ...acc,
    }), {});
  }
  //____________
  // mutation here!
  #updateGesturesMemory() {
    this.#gesturesMemory.event = null;
    this.#gesturesMemory.temporalCache = new Map();
  }
  //
  //////////////////////////////

  //____________
  gesturesInput(event) {
    // console.log("--0:", event.type);
    
    const _state = {
      exitCode: null,
      $data: new Map(),
      ...this.#gesturesWatchedNames,
      ...this.#gesturesActiveNames,
      _cnv_x: this.SKETCH.mouseX,
      _cnv_y: this.SKETCH.mouseY,
      _painterDeltaTime: this.SKETCH.deltaTime,
      _filtersCheckpoints: new Set(),
    }
    
    this.#gesturesMemory.event = event;
    this.#gesturesPipeline(this.#gesturesMemory, _state);
  }

  //____________
  // exitCode:
  // -> 0 = rejected
  // -> 1 = completed
  // -> 2 = error. unknown event type
  gesturesOutput(_memo, _state) {
    if (_state.exitCode === 1) {
      const $data = new Map(_state.$data);
      $data.set("$event", _memo._event);
      this.DISPATCHER.emitterInputTest(_memo, _state);
      this.#updateGesturesMemory();
      _state = undefined;
      return;
    }
    
    console.log("GESTURE NOT COMPLETED OK", _memo, _state);
    if (this.DEBUG && _state.exitCode !== 0) {
      dbgr.errorCase(_memo, _state);
    }
    _state = undefined;
  }
}




    // const now = performance.now();

    // gestures semantic system
    // this.#gesturesPipeline = pipelines.gestures;
    // this.#gesturesState = {
    //   _json_pointersIds: "[]", // <--stringified array
    //   _actualDynamicName: "",
    //   _actualStaticName: "",
    //   _actualDynamicTimestamp: now,
    //   _actualStaticTimestamp: now,
    //   _lastDynamicName: "",
    //   _lastStaticName: "",
    //   _lastDynamicTimestamp: now,
    //   _lastStaticTimestamp: now,
    //   __recursiveCaller__: this.#gesturesState.pointerInput,
    //   __newStateGenerator__: this.#gesturesStateGeneratorClosure(),
    //   __debouncingTimers__: new Map(),
    // }




  // //////////////////////////////
  // //
  // #gesturesStateGeneratorClosure(emitter) {
  //   return (preState) => {
  //     const newPreState = {
  //       ...preState,
  //       $data: new Map([
  //         ["$cnv-x", emitter.SKETCH.mouseX],
  //         ["$cnv-y", emitter.SKETCH.mouseY],
  //         ["$log"], ["__undefined__"]
  //       ]),
  //       _actualDynamicName: null, // <--setted somewhere in the pipelines
  //       _actualStaticName: null, // <--setted somewhere in the pipelines
  //       _actualDynamicTimestamp: null, // <--setted somewhere in the pipelines
  //       _actualStaticTimestamp: null, // <--setted somewhere in the pipelines
  //     }

  //     const activeGestures = emitter.DISPATCHER.getActiveGestures();
  //     const eachActiveGesture = activeGestures.reduce((acc, gesture) => ({
  //       ["_activeName_" + gesture.$semantic_name]: gesture.assignedPointerId,
  //       ...acc,
  //     }), {});
      
  //     const watchedGestures = emitter.DISPATCHER.getWatchedGestures();
  //     const eachWatchedGesture = watchedGestures.reduce((acc, gesture) => ({
  //       ["_watchedName_" + gesture.$semantic_name]: gesture._json_watchedDataNames,
  //       ...acc,
  //     }), {});

  //     return Object.assign(newPreState, eachActiveGesture, eachWatchedGesture);
  //   };
  // }

  // #gesturesPreStateGenerator() {
  //   return {
  //     isRecursion: false,
  //     isActivator: null, // <--setted in the first pipeline
  //     exitCode: null, // <--setted in the first pipeline
  //     $data: new Map(),
  //     _painterDeltaTime: this.SKETCH.deltaTime,
  //     _json_pointersIds: this.#gesturesState._json_pointersIds,
  //     _lastDynamicName: this.#gesturesState._actualDynamicName,
  //     _lastStaticName: this.#gesturesState._actualStaticName,
  //     _lastDynamicTimestamp: this.#gesturesState._actualDynamicTimestamp,
  //     _lastStaticTimestamp: this.#gesturesState._actualStaticTimestamp,
  //     __recursiveCaller__: this.#gesturesState.__recursiveCaller__,
  //     __newStateGenerator__: this.#gesturesState.__newStateGenerator__,
  //     __debouncingTimers__: this.#gesturesState.__debouncingTimers__,
  //   }
  // }

  // // exitCode
  // // -> 0 = nulled
  // // -> 1 = single dynamic
  // // -> 2 = single static
  // // -> 3 = mutli dynamic
  // // -> 4 = mutli static
  // // -> 5 = recursion (new gesture, or inertial movement)
  // // -> 6 = process completed
  // pointerInput(_e, recursiveState = null) {
  //   const isRecursion = recursiveState?.$data?.get("$isRecursion") ?? false;

  //   // process
  //   const response = isRecursion
  //     ? this.#gesturesPipeline(_e, recursiveState)
  //     : this.#gesturesPipeline(_e, this.#gesturesPreStateGenerator());

  //   // nulled or unknown error
  //   if (response.exitCode !== 6) {
  //     if (this.DEBUG) dbgr.nulledCase(response);
  //     return;
  //   }

  //   // output
  //   this.#gesturesState = response;
  //   _e.$data = response.$data;
  //   this.emit(_e);
  // }
