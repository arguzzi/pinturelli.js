import { typedParams } from "./validateTypes.js";
import { throwError } from "./debuggerOutput.js";

//////////////////////////////
//
function emptyMethod() {
  throwError(`Ui root`, `Invalid method execution (overwritten)`);
}

//////////////////////////////
//
export default {
  typedParams,
  emptyMethod,
}
