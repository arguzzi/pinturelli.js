import singlePointDynamicPipeline from "./singlePointDynamicPipeline.js";
import singlePointStaticPipeline from "./singlePointStaticPipeline.js";
import multiPointDynamicPipeline from "./multiPointDynamicPipeline.js";
import multiPointStaticPipeline from "./multiPointStaticPipeline.js";
import params from "./gesturesPipelinesParams.js";

////////////////////////////
//
const mainPipelines = Object.freeze([
  (_, state) => {  // <--should never be executed
    state.$data.set("$log", "error: mainPipelines[0] called");
    return state;
  },
  singlePointDynamicPipeline,
  singlePointStaticPipeline,
  multiPointDynamicPipeline,
  multiPointStaticPipeline,
]);

////////////////////////////
//
const recursionFirstPipeline = (_e, state) => {
  const response = { ...state, $data: new Map(state.$data) };
}

////////////////////////////
//
const newEventFirstPipeline = (_e, state) => {
  const response = { ...state, $data: new Map(state.$data) };
  const deltaTime = state._painterDeltaTime;

  // dynamic event
  if (_e.type === "pointermove") {
    
    // automatic throttle
    if (_e.timeStamp - state._lastDynamicTimestamp < deltaTime) {
      response.$data.set("$log", "F. automatic throttle (pointermove)");
      response.exitCode = 0;
      return response;
    }

    // check last timestamp and ids !%!
    if (0) {
      response.set("isActivator", true);
      response.set("exitCode", 1);
      return response;
    }

    // not activator output
    response.set("exitCode", 1);
    return response;
  }
  
  // static active event
  if (_e.type === "pointerdown") {
    response.set("isActive", true);
    response.set("exitCode", 2);
    return response;
  }

  // unknown event
  if (_e.type !== "pointercancel" && _e.type !== "pointerup") {
    response.set("exitCode", 0);
    return response;
  }

  // minimal static throttle 
  if (_e.timeStamp - state.get("_lastStaticTimestamp") < 300) {
    response.set("exitCode", 0);
    return response;
  }

  // static event
  response.set("isActive", false);
  response.set("exitCode", 2);
  return response;
}

////////////////////////////
//
// exitCode
// -> 0 = nulled
// -> 1 = single dynamic
// -> 2 = single static
// -> 3 = mutli dynamic
// -> 4 = mutli static
// -> 5 = recursion (new gesture, or inertial movement)
// -> 6 = process completed
const gesturesPipelinesIndex = (_e, preState) => {

  // preprocess
  const firstResponse = preState.isRecursion
    ? recursionFirstPipeline(_e, preState)
    : newEventFirstPipeline(_e, preState);

  // early nulled
  const firstExitCode = firstResponse.exitCode;
  if (firstExitCode === 0) return firstResponse;
  
  // process
  const state = preState.__newStateGenerator__(preState);
  const response = mainPipelines[firstExitCode](_e, state);
  const exitCode = response.exitCode;

  // nulled
  if (exitCode === 0) return response;

  // new gesture
  if (exitCode === 5) {
    response.isRecursion = true;
    response.__recursiveCaller__(_e, response);
    response.exitCode = 6;
  };

  // output
  return response;
}

////////////////////////////
//
export default gesturesPipelinesIndex;