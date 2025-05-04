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
const beginningsPipelines = (_memo, _state) => {
}

////////////////////////////
//
const endingsPipelines = (_memo, _state) => {
}

////////////////////////////
//
export default {
  beginningsPipelines,
  endingsPipelines,
}
