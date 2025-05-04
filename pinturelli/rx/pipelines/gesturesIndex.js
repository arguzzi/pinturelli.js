import singlePointDynamic from "./gesturesSinglePointDynamic.js";
import singlePointStatic from "./gesturesSinglePointStatic.js";
import multiPointDynamic from "./gesturesMultiPointDynamic.js";
import multiPointStatic from "./gesturesMultiPointStatic.js";
import params from "./gesturesIndexParams.js";

////////////////////////////
//
const EXIT_CODE = Object.freeze({
  REJECTED: 0,
  COMPLETED: 1,
  UNKNOWN_EVENT_TYPE: 2,
});

////////////////////////////
//
const mainPipelines = Object.freeze({
  singlePointDynamic,
  singlePointStatic,
  multiPointDynamic,
  multiPointStatic,
});

////////////////////////////
//
const pointerdownPipeline = (_memo, _state) => {
  console.log("--3:", _memo.event.type);
  _state.exitCode = EXIT_CODE.COMPLETED;
  const $data = new Map([_state.$data]);
  $data.set("$event_name", "$gesture_started");
  $data.set("$cnv_x", _state._cnv_x);
  $data.set("$cnv_y", _state._cnv_y);
  _memo._gesturesOutput(_memo, { ..._state, $data });
}

////////////////////////////
//
const pointermovePipeline = (_memo, _state) => {
  console.log("--2:", _memo.event.type);

  //____________
  // isPressed flag
  if (!_memo.isPressed) return;

  //____________
  // @> automatic throttle filter
  const elapsed = performance.now() - _memo.lastPointermovedInfo.get("time");
  if (
    !_state._filtersCheckpoints.has("automatic-throttle-filter") &&
    elapsed < _state._painterDeltaTime
  ) {
    const $log = `F@> automatic throttle filter (pointermove)`;
    const $data = new Map([["$log", $log]]);
    _memo._gesturesOutput(_memo, { 
      exitCode: EXIT_CODE.REJECTED,
      $data
    });
    return;
  }
  _state._filtersCheckpoints.add("automatic-throttle-filter");
  _memo.temporalCache.set("elapsed-time", elapsed);

  //____________
  // @> multi pointer
  if (_memo.activePointersIds.length > 0){
    multiPointStatic.beginningsPipelines(_memo, _state);
    return;
  }
  
  //____________
  // slop touch filter
  if (!_state._filtersCheckpoints.has("10px-slop-touch-filter") &&
    elapsed > params.MOVEMENT_ACTIVATOR_COUNTDOWN) {
    if (1) {

    }
  }

  //____________
  // minimal distance
  //
}

////////////////////////////
//
// exitCode
// -> 0 = rejected
// -> 1 = completed
// -> 2 = error. unknown event type
const gesturesPipelinesIndex = (_memo, _state) => {
  console.log("--1:", _memo.event.type);
  const type = _memo.event.type;

  //____________
  // @> pointermove pipeline
  if (type === "pointermove") {
    if (!_state.isPointermoveNeeded) return;
    pointermovePipeline(_memo, _state);
    return;
  }

  //____________
  // @> pointermove pipeline
  if (type === "pointerdown") {
    pointerdownPipeline(_memo, _state);
    return;
  }

  //____________
  // @> unknown event
  if (type !== "pointerup" && type !== "pointercancel") {
    const $log = `2@> unknown event type in context pipe: ${type}`;
    const $data = new Map([["$log", $log]]);
    _memo._gesturesOutput(_memo, { 
      exitCode: EXIT_CODE.UNKNOWN_EVENT_TYPE,
      $data
    });
    return;
  }

  //____________
  // @> multi pointer
  // if (_memo.activePointersIds.length > 0){
  //   multiPointStatic.endingsPipelines(_memo, _state);
  //   return;
  // }

  //____________
  // single point endings
  const endingPipelines = {
    "$gesture_started": "tapEnded",
    "$tapped": "tapEnded",
    "$tapped-double": "tapEnded",
    "$tapped-sequence": "tapEnded",
    "$holding-ended": "holdEnded",
    "$holding-double-tapped-ended": "holdEnded",
    "$dragging-ended": "dragEnded",
    "$dragging-double-tapped-ended": "dragEnded",
    "$scrolling-press-ended": "scrollPressEnded",
    "$swiping-press-ended": "swipePressEnded",
    "$throwing-press-ended": "throwPressEnded",
  }
  
  // @> gesture ended
  console.log("--4:", _memo.event.type);
  const hasState = prop => Object.hasOwn(_state, prop);
  for (const eventName of Object.keys(endingPipelines)) {
    if (!hasState("_activeName_" + eventName)) continue;
    
    console.log("--5:", eventName);

    const ok = singlePointStatic[endingPipelines[eventName]](_memo, _state);
    if (ok || !hasState("_watchedName_$gesture-cancelled")) continue;
    
    // @> gesture cancelled
    const $data = new Map([_state.$data]);
    $data.set("$event_name", "$gesture-cancelled");
    $data.set("$cancelled_names", eventName);
    $data.set("$cnv-x", _state._cnv_x);
    $data.set("$cnv-y", _state._cnv_y);
    _memo._gesturesOutput(_memo, { ..._state, $data });
  }

  // reset default
  _memo.event = null;
  _memo.isPressed = false;
  _memo.activePointersIds = new Set();
}

////////////////////////////
//
export default gesturesPipelinesIndex;

