import dbgr from "../debug/validateEmitter.js";

export default class PrimaryEmitter {
  #contextWatchedNames
  #contextGlobalState;
  #contextPipeline;
  #contextMemory;

  // #gesturesWatchedNames;
  // #gesturesGlobalState;
  // #gesturesPipeline;
  // #gesturesMemory;

  //____________
  // public properties will be freezed!!!
  constructor(GLOBAL, pipelines) {
    const { CONFIG, DISPATCHER, SKETCH } = GLOBAL;
    this.DEBUG = CONFIG.DEBUG;
    this.DISPATCHER = DISPATCHER;
    this.SKETCH = SKETCH;
    
    // context initializations
    this.#contextPipeline = pipelines.context;
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
    // this.#gesturesPipeline = pipelines.gestures;
    // this.#gesturesWatchedNames = {};
    // this.#gesturesGlobalState = {
    //   __gesturesOutput__: this.gesturesOutput.bind(this),
    //   __debouncingTimers__: new Map(),
    // }
    // this.#gesturesMemory = {
    //   _lastGestureStartedAt: 0,
    // }
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
      ["_watchedName_" + obj.$name]: obj.required,
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
  // -> 2 = unknown event type error
  contextOutput(_e, _state) {
    if (_state.exitCode === 1) {
      _e.$data = _state.$data;
      this.#updateContextMemory(_state);
      this.DISPATCHER.emitterInput(_e, _state);
      return;
    }
    
    if (this.DEBUG && _state.exitCode !== 0) {
      dbgr.errorCase(_state);
    }
  }

  gesturesInput(){}
}

// const a = {
//   //////////////////////////////
//   //
//   // GESTURES SEMANTIC SYSTEM:
//   //
//   // inputs:
//   // -> "pointerdown"
//   // -> "pointermove"
//   // -> "pointercancel"
//   // -> "pointerup"
//   // outputs:
//   // -> "$gesture-started"
//   // -> "$gesture-cancelled"
//   // -> "..."
//   //____________
//   // mutation here!
//   updateContextWatchedNames(watchedNames) {
//     // if (this.DEBUG) dbgr.watchedNamesParams(watchedNames);
//     // this.#gesturesWatchedNames = watchedNames.reduce((acc, obj) => ({
//     //   ["_watchedName_" + obj.$name]: obj.required,
//     //   ...acc,
//     // }), {});
//   }
//   //____________
//   // mutation here!
//   #updateGesturesMemory(_state) {
//     // this.#gesturesMemory._lastGestureStartedAt = _state._lastGestureStartedAt;
//   }
//   //
//   //////////////////////////////

//   //____________
//   #gesturesStateGenerator() {
//     // return {
//     //   ...this.#getGesturesGlobalState,
//     //   ...this.#gesturesWatchedNames,
//     //   exitCode: null,
//     //   $data: new Map(),
//     //   _painterDeltaTime: this.SKETCH.deltaTime,
//     //   __checkpoints__: new Set(),
//     // }
//   }

//   //____________
//   gesturesInput(_e) {
//     // const _state = this.#gesturesStateGenerator();
//     // this.#gesturesPipeline(_e, _state);
//   }

//   //____________
//   // exitCode:
//   // -> 0 = rejected
//   // -> 1 = completed
//   // -> 2 = unknown event type error
//   gesturesOutput(_e, _state) {
//     // if (_state.exitCode === 1) {
//     //   this.#updateGesturesMemory(_state);
//     //   this.DISPATCHER.emitterInput(_e, _state);
//     //   return;
//     // }
    
//     // if (this.DEBUG && _state.exitCode !== 0) {
//     //   dbgr.errorCase(_state);
//     // }
//   }
// }




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
  //       ["_activeName_" + gesture.$name]: gesture.assignedPointerId,
  //       ...acc,
  //     }), {});
      
  //     const watchedGestures = emitter.DISPATCHER.getWatchedGestures();
  //     const eachWatchedGesture = watchedGestures.reduce((acc, gesture) => ({
  //       ["_watchedName_" + gesture.$name]: gesture._json_watchedDataNames,
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
