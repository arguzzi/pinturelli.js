import params from "./gesturesPipelinesParams.js";

////////////////////////////
//
const EXIT_CODE = Object.freeze({
  REJECTED: 0,
  COMPLETED: 1,
  UNKNOWN_EVENT_TYPE: 2,
});


function steamPointer(_e, _s) {
  let response = {_e, _s};

  // not steam
  if (_e.type !== "pointermove") {
    response.exitCode = 0;
    return response;
  }

  return response;
}

export default {
  tap: 1,
  hold: 1,
  drag: 1,
  scroll: 1,
  swipe: 1,
  throw: 1,
}

