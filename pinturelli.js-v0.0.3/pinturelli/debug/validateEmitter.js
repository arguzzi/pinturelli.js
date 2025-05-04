import { areNot } from "./validateTypes.js";
import { throwError } from "./debuggerOutput.js";


//////////////////////////////
//
const errorCase = (response) => {
  // throwError(`Emitter (gestures pipeline)`, `Unespected output. Message: ${response.$data.get("$error")}`);
}



//////////////////////////////
//
const watchedNamesParams = (names) => {
}

//////////////////////////////
//
export default {
  watchedNamesParams,
  errorCase,
}


