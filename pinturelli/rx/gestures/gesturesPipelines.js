import singlePointDynamic from "./singlePointDynamicPipeline.js";
import singlePointStatic from "./singlePointStaticPipeline.js";
import multiPointDynamic from "./multiPointDynamicPipeline.js";
import multiPointStatic from "./multiPointStaticPipeline.js";
import params from "./gesturesPipelinesParams.js";

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
  if (_memo.isPointermoveNeeded && type === "pointermove") {
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
  if (_memo.activePointersIds.length > 0){
    multiPointStatic.endingsPipelines(_memo, _state);
    return;
  }

  //____________
  // single point endings
  const endingPipelines = {
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
  const hasProp = _state.hasOwnProperty;
  console.log("--4:", _memo.event.type);
  for (const $name of Object.keys(endingPipelines)) {
    if (!_state.hasOwnProperty("_activeNames_" + $name)) continue;
    
    console.log("--5:", $name);

    const completed = singlePointStatic[endingPipelines[$name]](_memo, _state);
    if (completed || !hasProp("_watchedNames_$gesture-cancelled")) continue;
    
    // @> gesture cancelled
    const $data = new Map([_state.$data]);
    $data.set("$name", "$gesture-cancelled");
    $data.set("$name-cancelled", $name);
    $data.set("$is-active", false);
    $data.set("$cnv-x", mouseX);
    $data.set("$cnv-y", mouseY);
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

