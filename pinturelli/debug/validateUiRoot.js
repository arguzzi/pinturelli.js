import { typedParams } from "./_typeValidators.js";
import { throwError } from "./_debugOutput.js";

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
